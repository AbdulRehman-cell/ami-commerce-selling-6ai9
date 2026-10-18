const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
const Review = require('./models/Reviews');
const seedData = async () => {
  try {
    // 1. Seed Users if empty
    const userCount = await User.countDocuments();
    let sampleUsers = [];
    if (userCount === 0) {
      sampleUsers = await User.insertMany([
        {
          name: 'Alex Mercer',
          email: 'alex@example.com',
          hashedPassword: '$2a$10$X8/L85xM8jD6rB1.sP1S8.pIe/K6Z0dJ9YV.g7x42L5k6A/8b8eS.', // password123
          role: 'user',
          addresses: [
            {
              street: '142 Turf Way',
              city: 'Boston',
              state: 'MA',
              zip: '02115',
              country: 'USA',
              isDefault: true
            }
          ]
        },
        {
          name: 'Samira Patel',
          email: 'samira@example.com',
          hashedPassword: '$2a$10$X8/L85xM8jD6rB1.sP1S8.pIe/K6Z0dJ9YV.g7x42L5k6A/8b8eS.',
          role: 'user',
          addresses: [
            {
              street: '88 Court Side Dr',
              city: 'Austin',
              state: 'TX',
              zip: '78701',
              country: 'USA',
              isDefault: true
            }
          ]
        },
        {
          name: 'AMI Admin',
          email: 'admin@amigear.com',
          hashedPassword: '$2a$10$X8/L85xM8jD6rB1.sP1S8.pIe/K6Z0dJ9YV.g7x42L5k6A/8b8eS.', // admin123
          role: 'admin',
          addresses: [
            {
              street: '1 Performance HQ Blvd',
              city: 'Seattle',
              state: 'WA',
              zip: '98101',
              country: 'USA',
              isDefault: true
            }
          ]
        }
      ]);
      console.log('Seed: Users seeded successfully.');
    } else {
      sampleUsers = await User.find({ role: 'user' });
    }

    // 2. Seed Products if empty
    const productCount = await Product.countDocuments();
    let seededProducts = [];
    if (productCount === 0) {
      const productsData = [
        // FIELD HOCKEY STICKS
        {
          name: 'Vortex Pro Carbon 95 Low Bow',
          category: 'Field Hockey',
          brand: 'AMI Performance',
          price: 289.99,
          stock: 18,
          description: 'A low-bow 95% Japanese carbon composite built for drag-flickers and playmakers who demand stick speed, explosive 3D skills, and unmatched power transmission on the release.',
          skillLevel: 'Professional',
          images: [
            'https://images.unsplash.com/photo-1517649763962-0c623266010b?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop'
          ],
          sizes: ['36.5" / Light (530g)', '37.5" / Medium (550g)']
        },
        {
          name: 'Kinetix Tour Mid Bow 70',
          category: 'Field Hockey',
          brand: 'AMI Performance',
          price: 199.50,
          stock: 25,
          description: 'Balanced mid-bow profile with 70% high-modulus carbon. Engineered for mid-field distribution, crisp slap-passing, and clean reception under pressure.',
          skillLevel: 'Intermediate',
          images: [
            'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop'
          ],
          sizes: ['36.5" / Medium (540g)', '37.5" / Medium (560g)']
        },
        {
          name: 'Origin Classic Composite 30',
          category: 'Field Hockey',
          brand: 'AMI Performance',
          price: 99.00,
          stock: 40,
          description: 'High fiberglass content paired with 30% carbon for maximum vibration absorption and forgiving control. The ideal entry stick for athletes refining foundational technique.',
          skillLevel: 'Beginner',
          images: [
            'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=800&auto=format&fit=crop'
          ],
          sizes: ['35" / Light (510g)', '36.5" / Medium (535g)']
        },
        {
          name: 'Apex Ultimate Extreme Low Bow 100',
          category: 'Field Hockey',
          brand: 'AMI Pro-Lab',
          price: 349.00,
          stock: 9,
          description: '100% Toray Carbon fiber with dual Kevlar impact zones. Extreme 24.75mm bow point at 200mm for aerials, drag-flicks, and lightning dynamic control.',
          skillLevel: 'Professional',
          images: [
            'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop'
          ],
          sizes: ['36.5" / Light (525g)', '37.5" / Light (535g)']
        },

        // PADEL RACKETS
        {
          name: 'Pulse Pro Carbon 18K Padel Racket',
          category: 'Padel',
          brand: 'AMI Padel',
          price: 249.99,
          stock: 14,
          description: 'Diamond shape with high balance and 18K woven carbon surface. Engineered for offensive smashers seeking lethal power and sweet-spot precision.',
          skillLevel: 'Professional',
          images: [
            'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&auto=format&fit=crop'
          ],
          sizes: ['Standard (365g ± 5g)']
        },
        {
          name: 'Precision Control 3K Padel Racket',
          category: 'Padel',
          brand: 'AMI Padel',
          price: 179.00,
          stock: 22,
          description: 'Round geometric frame with a low balance point and EVA Soft core. Maximum maneuverability and defense absorption for tactical placement players.',
          skillLevel: 'Intermediate',
          images: [
            'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&auto=format&fit=crop'
          ],
          sizes: ['Standard (360g ± 5g)']
        },
        {
          name: 'Shift Hybrid Fiberglass Padel Racket',
          category: 'Padel',
          brand: 'AMI Padel',
          price: 119.50,
          stock: 30,
          description: 'Teardrop shape offering the perfect harmony of power and forgiving control. Soft fiberglass face reduces arm strain during high-frequency drills.',
          skillLevel: 'Beginner',
          images: [
            'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop'
          ],
          sizes: ['Standard (355g ± 5g)']
        },

        // APPAREL
        {
          name: 'Pro-Match DriTurf Athletic Polo',
          category: 'Apparel',
          brand: 'AMI Active',
          price: 54.00,
          stock: 45,
          description: 'Ultra-lightweight 4-way stretch poly-spandex knit featuring laser-perforated back panels for maximum ventilation under peak match heat.',
          skillLevel: 'Intermediate',
          images: [
            'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop'
          ],
          sizes: ['Small', 'Medium', 'Large']
        },
        {
          name: 'TurfShield Compressed Match Shorts',
          category: 'Apparel',
          brand: 'AMI Active',
          price: 48.00,
          stock: 35,
          description: 'Built-in inner compression liner with abrasion-resistant hip panel inserts to protect during sliding tackles and low padel dives.',
          skillLevel: 'Intermediate',
          images: [
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop'
          ],
          sizes: ['Medium', 'Large']
        },

        // PROTECTION
        {
          name: 'ArmorFlex Pro Shin Guards with Sleeve',
          category: 'Protection',
          brand: 'AMI Guard',
          price: 42.00,
          stock: 50,
          description: 'Anatomically molded high-impact shell backed with dual-density memory EVA foam. Includes high-compression moisture-wicking calf sleeves.',
          skillLevel: 'Professional',
          images: [
            'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop'
          ],
          sizes: ['Medium (Height 5\'4" - 5\'10")', 'Large (Height 5\'11"+)']
        },
        {
          name: 'Impact-X Full Finger Left Hand Glove',
          category: 'Protection',
          brand: 'AMI Guard',
          price: 38.00,
          stock: 28,
          description: 'Targeted high-density armor plates over knuckles and fingers with open palm texture for sticky stick grip in wet artificial turf conditions.',
          skillLevel: 'Intermediate',
          images: [
            'https://images.unsplash.com/photo-1589138777373-22415b576fbf?w=800&auto=format&fit=crop'
          ],
          sizes: ['Medium', 'Large']
        },

        // BAGS
        {
          name: 'Squad XL Tour Field Hockey Bag',
          category: 'Bags',
          brand: 'AMI Luggage',
          price: 110.00,
          stock: 16,
          description: 'Carries up to 4 hockey sticks in a dedicated padded sleeve, isolated ventilated shoe compartment, and waterproof tarpaulin base for damp turf.',
          skillLevel: 'Professional',
          images: [
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop'
          ],
          sizes: ['65L Capacity']
        },

        // BALLS & EQUIPMENT
        {
          name: 'Dimple Max Match Turf Ball (6-Pack)',
          category: 'Balls & Equipment',
          brand: 'AMI Official',
          price: 32.50,
          stock: 60,
          description: 'FIH compliant dimpled hollow cork center ball designed for high-speed true rolling consistency across modern water-based astroturf pitches.',
          skillLevel: 'Intermediate',
          images: [
            'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&auto=format&fit=crop'
          ],
          sizes: ['6-Pack Box']
        }
      ];

      seededProducts = await Product.insertMany(productsData);
      console.log('Seed: Products seeded successfully.');
    } else {
      seededProducts = await Product.find();
    }

    // 3. Seed Reviews if empty
    const reviewCount = await Review.countDocuments();
    if (reviewCount === 0 && sampleUsers.length > 0 && seededProducts.length > 0) {
      const vortexStick = seededProducts.find(p => p.name.includes('Vortex Pro Carbon 95'));
      const pulsePadel = seededProducts.find(p => p.name.includes('Pulse Pro Carbon 18K'));

      const reviewsToInsert = [];

      if (vortexStick) {
        reviewsToInsert.push({
          userId: sampleUsers[0]._id,
          productId: vortexStick._id,
          rating: 5,
          comment: 'The power on drag flicks is unbelievable! Clean release, super crisp response on the 3D touches.'
        });
      }

      if (pulsePadel) {
        reviewsToInsert.push({
          userId: sampleUsers[1] ? sampleUsers[1]._id : sampleUsers[0]._id,
          productId: pulsePadel._id,
          rating: 5,
          comment: 'Incredible balance and pop on the smash. The 18K carbon face gives superior feedback on every shot.'
        });
      }

      if (reviewsToInsert.length > 0) {
        await Review.insertMany(reviewsToInsert);
        console.log('Seed: Sample reviews seeded successfully.');
      }
    }

  } catch (err) {
    console.error('Seed process encountered an error:', err);
  }
};

// Run instantly on module import inside server process
seedData();

module.exports = seedData;