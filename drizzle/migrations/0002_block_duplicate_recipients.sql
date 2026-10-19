CREATE OR REPLACE FUNCTION public.normalize_name(n text) RETURNS text LANGUAGE sql IMMUTABLE SET search_path TO 'public' AS $$
SELECT lower(trim(regexp_replace(regexp_replace(regexp_replace(
  translate(regexp_replace(coalesce(n,''), '[\u064B-\u065F\u0670\u0640]', '', 'g'), 'أإآٱةىؤئ', 'ااااهيوي'),
  '[^\u0621-\u064Aa-zA-Z ]', ' ', 'g'), '(.)\1+', '\1', 'g'), '\s+', ' ', 'g')))
$$;

CREATE OR REPLACE FUNCTION public.validate_distribution()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$ DECLARE received integer; delivered integer; adjusted integer; current_status text; BEGIN
SELECT status INTO current_status FROM public.batches WHERE id=NEW.batch_id FOR UPDATE;
IF current_status IS DISTINCT FROM 'open' THEN RAISE EXCEPTION 'الدفعة مغلقة'; END IF;
IF public.normalize_name(NEW.recipient_name) = '' THEN RAISE EXCEPTION 'اسم المستلم غير صالح'; END IF;
IF EXISTS(SELECT 1 FROM public.distributions WHERE batch_id=NEW.batch_id AND public.normalize_name(recipient_name)=public.normalize_name(NEW.recipient_name)) THEN RAISE EXCEPTION 'هذا الاسم مسجل مسبقاً في هذه الدفعة وتم استلام حصته'; END IF;
SELECT quantity INTO received FROM public.agent_allocations WHERE batch_id=NEW.batch_id AND agent_id=NEW.agent_id;
SELECT coalesce(sum(quantity),0) INTO delivered FROM public.distributions WHERE batch_id=NEW.batch_id AND agent_id=NEW.agent_id AND status='approved';
SELECT coalesce(sum(amount),0) INTO adjusted FROM public.adjustments WHERE batch_id=NEW.batch_id AND agent_id=NEW.agent_id;
IF received IS NULL OR NEW.quantity>received-delivered+adjusted THEN RAISE EXCEPTION 'الكمية تتجاوز المتبقي'; END IF;
IF NEW.citizen_id IS NOT NULL AND NOT coalesce((SELECT collect_citizen_id FROM public.app_settings WHERE id=true),false) THEN RAISE EXCEPTION 'جمع الهوية غير مفعل'; END IF;
RETURN NEW; END $function$;