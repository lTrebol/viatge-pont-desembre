-- =====================================================================
-- VOTACIÓ — Escapada de desembre 2026
-- Esquema complet per a Supabase (Postgres), per a un projecte NOU.
-- (Si ja havíeu executat la primera versió amb codis, executeu migracio-02-sense-codis.sql.)
-- Executar UN COP sencer a: Supabase → SQL Editor → New query → enganxar → Run
--
-- Com funciona:
--   · Cada persona tria el seu nom d'una llista tancada (taula participants). Sense codis.
--   · El vot queda lligat al navegador on s'ha fet (identificador aleatori que la web genera
--     sola): ningú pot canviar el vot d'una altra persona des d'un altre dispositiu.
--   · El recompte NO surt de la base de dades fins que arriba la data límit, ha votat tothom
--     o es tanca a mà. En aquell moment la votació queda tancada.
--   · Totes les taules tenen Row Level Security sense polítiques: el navegador no les pot
--     llegir ni escriure; només pot cridar les funcions de sota.
-- =====================================================================

-- ---------- Taules ----------
create table if not exists public.participants (
  id  bigint generated always as identity primary key,
  nom text not null unique
);

create table if not exists public.cases_votables (
  id  int primary key,
  nom text not null
);

create table if not exists public.vots (
  participant_id bigint primary key references public.participants(id) on delete cascade,
  casa_id        int not null references public.cases_votables(id),
  dispositiu     text not null,
  actualitzat    timestamptz not null default now()
);

-- Una sola fila: oberta/tancada i data límit.
create table if not exists public.votacio_estat (
  id         boolean primary key default true check (id),
  oberta     boolean not null default true,
  data_limit timestamptz
);
insert into public.votacio_estat (id, oberta) values (true, true) on conflict (id) do nothing;

-- Cases que es poden votar: les mateixes que mostra la web (capacitat de 7 o més).
insert into public.cases_votables (id, nom) values
  (1, 'Chalet Matemale'),
  (5, 'Maison Le Boulou'),
  (6, 'Maison Mânes'),
  (7, 'Gran caseta de la Source'),
  (8, '«Le Bellevue» côté Montagne')
on conflict (id) do update set nom = excluded.nom;

-- ---------- Accés directe tancat ----------
alter table public.participants   enable row level security;
alter table public.cases_votables enable row level security;
alter table public.vots           enable row level security;
alter table public.votacio_estat  enable row level security;
revoke all on public.participants, public.cases_votables, public.vots, public.votacio_estat
  from anon, authenticated;

-- ---------- Funció interna: els resultats ja es poden veure? ----------
create or replace function public.resultats_visibles()
returns boolean
language sql stable security definer set search_path = public
as $$
  select not e.oberta
      or (e.data_limit is not null and now() >= e.data_limit)
      or ((select count(*) from participants) > 0
          and (select count(*) from vots) >= (select count(*) from participants))
  from votacio_estat e where e.id;
$$;

-- ---------- Funcions que pot cridar la web ----------

-- Llista de noms i si cadascú ja ha votat (no diu QUÈ ha votat).
create or replace function public.participants_votacio()
returns json
language sql stable security definer set search_path = public
as $$
  select coalesce(json_agg(json_build_object('nom', p.nom, 'ha_votat', v.participant_id is not null) order by p.nom), '[]'::json)
  from participants p left join vots v on v.participant_id = p.id;
$$;

-- El vot d'una persona, només si es demana des del mateix navegador on es va fer.
create or replace function public.el_meu_vot(p_nom text, p_dispositiu text)
returns int
language sql stable security definer set search_path = public
as $$
  select v.casa_id
  from vots v join participants p on p.id = v.participant_id
  where p.nom = p_nom and v.dispositiu = p_dispositiu;
$$;

create or replace function public.votar(p_nom text, p_casa int, p_dispositiu text)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_participant bigint;
  v_dispositiu  text;
begin
  if resultats_visibles() then raise exception 'votacio_tancada'; end if;
  if p_dispositiu is null or length(p_dispositiu) < 16 then raise exception 'dispositiu_invalid'; end if;
  select id into v_participant from participants where nom = p_nom;
  if v_participant is null then raise exception 'participant_desconegut'; end if;
  if not exists (select 1 from cases_votables where id = p_casa) then raise exception 'casa_invalida'; end if;
  select dispositiu into v_dispositiu from vots where participant_id = v_participant;
  if v_dispositiu is not null and v_dispositiu <> p_dispositiu then raise exception 'vot_altre_dispositiu'; end if;
  insert into vots (participant_id, casa_id, dispositiu) values (v_participant, p_casa, p_dispositiu)
  on conflict (participant_id) do update set casa_id = excluded.casa_id, actualitzat = now();
end;
$$;

create or replace function public.retirar_vot(p_nom text, p_dispositiu text)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_participant bigint;
begin
  if resultats_visibles() then raise exception 'votacio_tancada'; end if;
  select id into v_participant from participants where nom = p_nom;
  if v_participant is null then raise exception 'participant_desconegut'; end if;
  delete from vots where participant_id = v_participant and dispositiu = p_dispositiu;
  if not found then raise exception 'vot_altre_dispositiu'; end if;
end;
$$;

-- Estat de la votació. El recompte per casa només s'inclou quan ja és visible.
create or replace function public.resultats()
returns json
language sql stable security definer set search_path = public
as $$
  select json_build_object(
    'visibles',     resultats_visibles(),
    'data_limit',   (select data_limit from votacio_estat where id),
    'participants', (select count(*) from participants),
    'votants',      (select count(*) from vots),
    'vots', case when resultats_visibles() then coalesce((
      select json_agg(json_build_object('casa_id', casa_id, 'vots', n) order by casa_id)
      from (select casa_id, count(*) as n from vots group by casa_id) t
    ), '[]'::json) else null end
  );
$$;

-- ---------- Permisos ----------
revoke execute on function public.resultats_visibles(), public.participants_votacio(),
  public.el_meu_vot(text, text), public.votar(text, int, text), public.retirar_vot(text, text),
  public.resultats() from public, anon, authenticated;
grant execute on function public.participants_votacio(), public.el_meu_vot(text, text),
  public.votar(text, int, text), public.retirar_vot(text, text), public.resultats()
  to anon, authenticated;


-- =====================================================================
-- CONFIGURACIÓ (executar a part, amb els vostres valors)
-- =====================================================================
-- Participants (el nom és el que veurà cadascú a la llista):
-- insert into public.participants (nom) values ('Nom 1'), ('Nom 2'), ('Nom 3'), ('Nom 4'), ('Nom 5'), ('Nom 6'), ('Nom 7');
--
-- Data límit (hora de Barcelona):
-- update public.votacio_estat set data_limit = '2026-11-15 23:59 Europe/Madrid' where id;

-- =====================================================================
-- GESTIÓ
-- =====================================================================
-- Tancar ja i mostrar resultats:  update public.votacio_estat set oberta = false where id;
-- Tornar-la a obrir:              update public.votacio_estat set oberta = true  where id;
-- Canviar la data límit:          update public.votacio_estat set data_limit = '2026-11-20 21:00 Europe/Madrid' where id;
-- Afegir/treure una persona:      insert into public.participants (nom) values ('Nom 8');
--                                 delete from public.participants where nom = 'Nom 8';
-- Algú ha canviat de mòbil i vol canviar el vot: esborreu-lo i que torni a votar:
--   delete from public.vots where participant_id = (select id from public.participants where nom = 'Nom 1');
-- Veure qui ha votat què (només des del panell):
--   select p.nom, c.nom as casa, v.actualitzat from public.vots v
--   join public.participants p on p.id = v.participant_id join public.cases_votables c on c.id = v.casa_id
--   order by c.nom, p.nom;
