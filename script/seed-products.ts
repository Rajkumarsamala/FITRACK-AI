import { getUncachableStripeClient } from '../server/stripeClient';

async function createProducts() {
  console.log('Creating FitTrack AI Premium product...');
  
  const stripe = await getUncachableStripeClient();
  
  const existingProducts = await stripe.products.search({ 
    query: "name:'FitTrack AI Premium'" 
  });
  
  if (existingProducts.data.length > 0) {
    console.log('FitTrack AI Premium product already exists:', existingProducts.data[0].id);
    
    const prices = await stripe.prices.list({
      product: existingProducts.data[0].id,
      active: true
    });
    
    if (prices.data.length > 0) {
      console.log('Price already exists:', prices.data[0].id);
      return;
    }
  }
  
  const product = await stripe.products.create({
    name: 'FitTrack AI Premium',
    description: 'Unlimited AI body scans, personalized recommendations, and progress tracking',
    metadata: {
      app: 'fittrack-ai',
      tier: 'premium'
    }
  });
  
  console.log('Created product:', product.id);
  
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 999,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: {
      app: 'fittrack-ai',
      tier: 'premium'
    }
  });
  
  console.log('Created monthly price:', price.id, '($9.99/month)');
  console.log('Done! Products and prices created successfully.');
}

createProducts().catch(console.error);
