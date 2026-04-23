const PAGBANK_TOKEN = '286ed4fa-ecd0-45e9-86e3-c664d9dc72c0d508d1c345ce822bf650b4bf7704ca0a5ab9-bef2-4c97-be00-bcac8b7ec22d';
const EMAIL = 'contato@royalsaude.com.br';

const params = new URLSearchParams();
params.append('currency', 'BRL');
params.append('itemId1', '0001');
params.append('itemDescription1', 'Plano Teste');
params.append('itemAmount1', '100.00');
params.append('itemQuantity1', '1');

fetch('https://ws.pagseguro.uol.com.br/v2/checkout?email=' + EMAIL + '&token=' + PAGBANK_TOKEN, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: params.toString()
})
.then(res => res.text().then(t => ({ status: res.status, ok: res.ok, text: t })))
.then(data => {
  console.log('Result:', JSON.stringify(data, null, 2));
})
.catch(err => console.error(err));
