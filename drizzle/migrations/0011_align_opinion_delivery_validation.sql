CREATE OR REPLACE FUNCTION public.validate_opinion()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $function$
BEGIN
  IF NEW.satisfaccion IS NULL OR NEW.satisfaccion < 1 OR NEW.satisfaccion > 5 THEN RAISE EXCEPTION 'satisfaccion invalida'; END IF;
  IF NEW.lo_usaria NOT IN ('si','tal_vez','no') THEN RAISE EXCEPTION 'lo_usaria invalido'; END IF;
  IF NEW.servicio_preferido NOT IN ('taxi','tramo1','tramo2','tipo1','tipo2') THEN RAISE EXCEPTION 'servicio invalido'; END IF;
  IF length(coalesce(NEW.codigo_encuestador,'')) > 50 THEN RAISE EXCEPTION 'codigo encuestador muy largo'; END IF;
  IF length(coalesce(NEW.zona,'')) > 80 OR length(coalesce(NEW.precio_justo,'')) > 120 OR length(coalesce(NEW.comentario,'')) > 600 OR length(coalesce(NEW.whatsapp,'')) > 20 THEN RAISE EXCEPTION 'texto muy largo'; END IF;
  IF NEW.tiempo_segundos IS NOT NULL AND (NEW.tiempo_segundos < 0 OR NEW.tiempo_segundos > 86400) THEN NEW.tiempo_segundos := NULL; END IF;
  RETURN NEW;
END $function$;