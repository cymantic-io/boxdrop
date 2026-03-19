import { registerUser, createSaleViaApi, activateSaleViaApi, uniqueEmail } from './helpers';

async function test() {
  try {
    const email = uniqueEmail('test');
    console.log('Registering user:', email);
    const tokens = await registerUser(email, 'Test User');
    console.log('Got tokens:', tokens.userId);
    
    console.log('Creating sale...');
    const sale = await createSaleViaApi(tokens, {
      title: 'Debug Sale',
      address: '123 Test St',
      latitude: 10,
      longitude: 10,
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 86400000).toISOString()
    });
    console.log('Sale response:', JSON.stringify(sale, null, 2));
    
    console.log('Activating sale with ID:', sale.id);
    const activated = await activateSaleViaApi(tokens, sale.id);
    console.log('Activated:', activated);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
