
const PAGBANK_TOKEN = "baf20978-35fe..."; // Simulado
const url = "https://api.pagseguro.com/subscriptions/plans";

async function testHeaders(userAgent: string) {
  console.log(`\nTestando com User-Agent: ${userAgent}`);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${PAGBANK_TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": userAgent
      }
    });
    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log(`Início da resposta: ${text.substring(0, 200)}`);
  } catch (e) {
    console.error(`Erro: ${e.message}`);
  }
}

// Testes locais simulados não funcionarão sem o token real, 
// mas o objetivo aqui é ver se o status muda de 403 (Cloudflare) para algo da API (ex: 401 Unauthorized)
// Se mudar para 401, significa que o Cloudflare deixou passar e o problema é o Token.
