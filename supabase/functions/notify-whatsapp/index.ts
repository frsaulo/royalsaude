import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ZAPI_INSTANCE        = Deno.env.get("ZAPI_INSTANCE") ?? "3F0020F414F92196B127E629027F956B";
const ZAPI_TOKEN           = Deno.env.get("ZAPI_TOKEN") ?? "548ADF4DC416151D4D4FEC18";
const ZAPI_CLIENT_TOKEN    = Deno.env.get("ZAPI_CLIENT_TOKEN") ?? "F00f57dbdaae34b159817cf779e2a434cS";
const SUPABASE_URL         = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("55") && digits.length >= 12) return digits;
  return `55${digits}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

function buildConfirmMessage(name: string, date: string, time: string, type: string): string {
  const isTele = type === "telemedicina";
  return (
    `\uD83C\uDFE5 *RoyalMed Health \u2013 Consulta Confirmada!*\n\n` +
    `Ol\u00e1, *${name}*! \u2705\n\n` +
    `Sua consulta foi agendada com sucesso:\n\n` +
    `\uD83D\uDCC5 *Data:* ${date}\n` +
    `\u23F0 *Hor\u00e1rio:* ${time}\n` +
    `\uD83D\uDCCD *Modalidade:* ${isTele ? "Telemedicina \uD83D\uDCBB" : "Presencial \uD83C\uDFE5"}\n\n` +
    (isTele
      ? `O link ser\u00e1 enviado 15 minutos antes da consulta.\n\n`
      : `*Endere\u00e7o:* Rua Pedro Celestino, 2395 - Centro, Campo Grande - MS, 79002-372\n\n`) +
    `\u26A0\uFE0F *Aviso:* Sua consulta s\u00f3 ser\u00e1 confirmada ap\u00f3s a confirma\u00e7\u00e3o do pagamento.\n\n` +
    `\uD83D\uDCC3 *Link para Pagamento:* https://pag.ae/81J592y2N\n\n` +
    `\u26A0\uFE0F Cancelamentos devem ser feitos com pelo menos *24h de anteced\u00eancia*.\n\n` +
    `D\u00favidas? Fale conosco por aqui mesmo! \uD83D\uDE0A\n` +
    `*RoyalMed Health* \uD83D\uDC99`
  );
}

function buildCancelMessage(name: string, date: string, time: string): string {
  return (
    `\uD83C\uDFE5 *RoyalMed Health \u2013 Consulta Cancelada*\n\n` +
    `Ol\u00e1, *${name}*!\n\n` +
    `Sua consulta do dia *${date}* \u00e0s *${time}* foi cancelada com sucesso.\n\n` +
    `Se desejar remarcar, acesse nosso site ou entre em contato conosco.\n\n` +
    `*RoyalMed Health* \uD83D\uDC99`
  );
}

function buildRescheduleMessage(name: string, date: string, time: string): string {
  return (
    `\uD83C\uDFE5 *RoyalMed Health \u2013 Consulta Liberada*\n\n` +
    `Ol\u00e1, *${name}*!\n\n` +
    `Sua consulta do dia *${date}* \u00e0s *${time}* foi liberada.\n\n` +
    `\uD83D\uDCC5 Escolha um novo hor\u00e1rio acessando sua agenda no nosso site.\n\n` +
    `*RoyalMed Health* \uD83D\uDC99`
  );
}

function buildRescheduleNewMessage(name: string, oldDate: string, oldTime: string, newDate: string, newTime: string, specialty: string): string {
  return (
    `\uD83C\uDFE5 *RoyalMed Health \u2013 Consulta Remarcada*\n\n` +
    `Ol\u00e1, *${name}*! \uD83D\uDCC6\n\n` +
    `Sua consulta foi remarcada com sucesso!\n\n` +
    `\u274C *Hor\u00e1rio anterior:*\n` +
    `\uD83D\uDCC5 ${oldDate} \u00e0s ${oldTime}\n\n` +
    `\u2705 *Novo hor\u00e1rio:*\n` +
    `\uD83D\uDCC5 *Data:* ${newDate}\n` +
    `\u23F0 *Hor\u00e1rio:* ${newTime}\n` +
    `\uD83C\uDF1F *Especialidade:* ${specialty}\n\n` +
    `\u26A0\uFE0F *Aviso:* Sua consulta s\u00f3 ser\u00e1 confirmada ap\u00f3s a confirma\u00e7\u00e3o do pagamento.\n\n` +
    `\uD83D\uDCC3 *Link para Pagamento:* https://pag.ae/81J592y2N\n\n` +
    `\u26A0\uFE0F Cancelamentos devem ser feitos com pelo menos *24h de anteced\u00eancia*.\n\n` +
    `D\u00favidas? Fale conosco por aqui mesmo! \uD83D\uDE0A\n` +
    `*RoyalMed Health* \uD83D\uDC99`
  );
}

async function sendWhatsApp(phone: string, message: string): Promise<{ ok: boolean; body?: any; error?: string }> {
  if (!ZAPI_INSTANCE || !ZAPI_TOKEN) {
    throw new Error("ZAPI configuration missing");
  }

  const zapiUrl = `https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}/send-text`;
  const res = await fetch(zapiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "client-token": ZAPI_CLIENT_TOKEN ?? "",
    },
    body: JSON.stringify({ phone, message }),
  });
  const body = await res.json();
  if (!res.ok) return { ok: false, error: JSON.stringify(body) };
  return { ok: true, body };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const payload = await req.json();

    if (payload.action) {
      const { action, phone, patientName, date, time, oldDate, oldTime, specialty } = payload;

      const cleanDigits = (phone ?? "").replace(/\D/g, "");
      if (cleanDigits.length < 8) {
        return new Response(JSON.stringify({ ok: false, reason: "no_valid_phone" }), {
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }

      const formattedPhone = formatPhone(phone);
      const name           = patientName || "Paciente";

      let message: string;

      if (action === "cancel") {
        message = buildCancelMessage(name, formatDate(date), (time ?? "").substring(0, 5));
      } else if (action === "reschedule_new") {
        message = buildRescheduleNewMessage(
          name,
          formatDate(oldDate ?? date),
          (oldTime ?? time ?? "").substring(0, 5),
          formatDate(date),
          (time ?? "").substring(0, 5),
          specialty || "Geral"
        );
      } else {
        message = buildRescheduleMessage(name, formatDate(date), (time ?? "").substring(0, 5));
      }

      console.log(`[notify-whatsapp] action=${action} phone=${formattedPhone}`);
      const result = await sendWhatsApp(formattedPhone, message);
      
      return new Response(JSON.stringify({ ok: result.ok, phone: formattedPhone, ...result }), {
        status: result.ok ? 200 : 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const { type, record } = payload;

    if (type !== "INSERT") {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const appointment = record;
    console.log("[notify-whatsapp] appointment:", appointment.id);

    let patientPhone = appointment.phone ?? "";
    let patientName  = appointment.patient_name || "Paciente";

    if (SUPABASE_SERVICE_KEY && appointment.user_id) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
      const { data: profile } = await supabase
        .from("profiles")
        .select("phone, full_name")
        .eq("id", appointment.user_id)
        .single();
      if (profile?.phone)     patientPhone = profile.phone;
      if (profile?.full_name) patientName  = profile.full_name;
    }

    const cleanDigits = patientPhone.replace(/\D/g, "");
    if (cleanDigits.length < 8) {
      return new Response(JSON.stringify({ ok: false, reason: "no_valid_phone" }), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const formattedPhone = formatPhone(patientPhone);
    const dateFormatted  = formatDate(appointment.date);
    const timeFormatted  = (appointment.time ?? "").substring(0, 5);

    const message = buildConfirmMessage(patientName, dateFormatted, timeFormatted, appointment.type ?? "");

    const result = await sendWhatsApp(formattedPhone, message);

    return new Response(
      JSON.stringify({ ok: result.ok, phone: formattedPhone, ...result }),
      { status: result.ok ? 200 : 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );

  } catch (err: any) {
    console.error("[notify-whatsapp] Erro:", err.message);
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }
});

