-- =====================================================================
-- MIGRACIÓ 02 — Votació sense codis i resultats ocults fins al final
-- Per a projectes on JA s'ha executat la primera versió d'esquema.sql.
-- Executar UN COP sencer a Supabase → SQL Editor → New query → Run.
-- (Si comenceu de zero, executeu només esquema.sql, que ja inclou aquests canvis.)
--
-- Què canvia:
--   · Ja no hi ha codis: cada persona tria el seu nom d'una llista tancada.
--   · El vot queda lligat al navegador on s'ha fet (un identificador aleatori que la web
--     genera i desa sola): ningú pot canviar el vot d'una altra persona des d'un altre mòbil.
--   · Els resultats NO surten de la base de dades fins que (a) arriba la data límit,
--     (b) ha votat tothom o (c) tanqueu la votació a mà. En aquell moment la votació es tanca.
-- =====================================================================

-- ---------- Funcions antigues (amb codi) ----------
drop function if exists public.entrar(text);
drop function if exists public.votar(text, int);
drop function if exists public.retirar_vot(text);
drop function if exists public.resultats();

-- ---------- Taules ----------
alter table public.participants  drop column if exists codi;
alter table public.vots          add column if not exists dispositiu text;
alter table public.votacio_estat add column if not exists data_limit timestamptz;

-- Els vots de prova fets amb la versió anterior no tenen dispositiu: s'esborren.
delete from public.vots where dispositiu is null;
alter table public.vots alter column dispositiu set not null;

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

-- ---------- Data límit (CANVIEU-LA) ----------
-- Hora de Barcelona. Fins aquell moment ningú veu el recompte (excepte si ja ha votat tothom).
-- update public.votacio_estat set data_limit = '2026-11-15 23:59 Europe/Madrid' where id;

-- Comprovació: ha de sortir {"visibles": false, "vots": null, ...}
select public.resultats();
