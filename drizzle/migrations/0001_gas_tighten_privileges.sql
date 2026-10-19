REVOKE EXECUTE ON FUNCTION public.create_profile() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_distribution() FROM PUBLIC, anon, authenticated;
REVOKE DELETE ON public.batches FROM authenticated;
REVOKE ALL ON public.agents FROM anon;
GRANT SELECT(id,name,area,district,active) ON public.agents TO anon;
CREATE OR REPLACE FUNCTION public.validate_adjustment() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE current_status text; BEGIN SELECT status INTO current_status FROM public.batches WHERE id=NEW.batch_id FOR UPDATE; IF current_status IS DISTINCT FROM 'open' OR NOT EXISTS(SELECT 1 FROM public.agent_allocations WHERE batch_id=NEW.batch_id AND agent_id=NEW.agent_id) THEN RAISE EXCEPTION 'يجب اختيار دفعة مفتوحة وحصة مسجلة'; END IF; RETURN NEW; END $$;
REVOKE ALL ON FUNCTION public.validate_adjustment() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER validate_gas_adjustment BEFORE INSERT ON public.adjustments FOR EACH ROW EXECUTE FUNCTION public.validate_adjustment();