const express = require('express');
const cors = require('cors');
const stripe = require('stripe')('sk_test_51HpFicBzXQ043S59zYJDLrvmPk5PrUKnnaE8JzKPZ2vmAy4BpSXd8vsuEuDw2bQDs0bTmTp6W91VcLta4rKwFdPF00cx0mf3JY');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  const { lastName, firstName, email, ip } = req.body; 
    try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: 'price_1RfnOOBzXQ043S59s4F2b9U5',
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'http://localhost:5500/success.html',
      cancel_url: 'http://localhost:5500/cancel.html',
        customer_email: email,                 // pour customer_details.email
      metadata: { lastName, firstName, ip }  // toutes tes données
    });
    res.json({ id: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(4242, () => console.log('Server running on port 4242'));
