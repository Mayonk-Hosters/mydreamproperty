// Pure Node.js server without external frameworks
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

// Simple template engine
function renderTemplate(templatePath, data = {}) {
  let template = fs.readFileSync(templatePath, 'utf8');
  
  // Replace placeholders with actual data
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    template = template.replace(regex, value);
  }
  
  return template;
}

// MIME types for static files
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Sample data (replace with database queries)
const sampleProperties = [
  {
    id: 1,
    title: 'Suburban Family Home',
    description: 'This beautiful house features 4 bedrooms, 3 bathrooms, and 2800 square feet of living space. Located in Austin, TX, it offers modern amenities and a great location.',
    price: 925000,
    location: 'Austin, TX',
    address: '789 Suburban Dr, Austin, TX 78701',
    beds: 4,
    baths: 3,
    area: 2800,
    propertyType: 'House',
    type: 'sell',
    status: 'active',
    featured: false,
    images: [
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400'
    ],
    agentId: 3
  },
  {
    id: 2,
    title: 'Beachfront Villa',
    description: 'This beautiful house features 6 bedrooms, 7 bathrooms, and 8500 square feet of luxury living space. Located in Miami Beach, FL, it offers panoramic ocean views and direct beach access.',
    price: 12500000,
    location: 'Miami Beach, FL',
    address: '123 Ocean Drive, Miami Beach, FL 33139',
    beds: 6,
    baths: 7,
    area: 8500,
    propertyType: 'House',
    type: 'sell',
    status: 'active',
    featured: true,
    images: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400',
      'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400'
    ],
    agentId: 1
  }
];

const sampleAgents = [
  {
    id: 1,
    name: 'Jessica Williams',
    title: 'Luxury Property Specialist',
    email: 'jessica@example.com',
    contactNumber: '+1-555-123-4567',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=250&h=250',
    rating: 4.9,
    deals: 149
  },
  {
    id: 2,
    name: 'Michael Chen',
    title: 'Commercial Real Estate Agent',
    email: 'michael@example.com',
    contactNumber: '+1-555-987-6543',
    image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&auto=format&fit=crop&w=250&h=250',
    rating: 4.7,
    deals: 87
  },
  {
    id: 3,
    name: 'Sarah Johnson',
    title: 'Residential Property Expert',
    email: 'sarah@example.com',
    contactNumber: '+1-555-789-0123',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=250&h=250',
    rating: 4.8,
    deals: 132
  }
];

// Route handlers
const routes = {
  '/': (req, res) => {
    const featuredProperties = sampleProperties.filter(p => p.featured);
    const allProperties = sampleProperties.slice(0, 6);
    
    const homeData = {
      title: 'My Dream Property - Find Your Perfect Home',
      featuredProperties: featuredProperties.map(p => `
        <div class="property-card">
          <img src="${p.images[0]}" alt="${p.title}" class="property-image">
          <div class="property-info">
            <h3>${p.title}</h3>
            <p class="price">$${p.price.toLocaleString()}</p>
            <p class="location">${p.location}</p>
            <div class="property-details">
              <span>${p.beds} beds</span>
              <span>${p.baths} baths</span>
              <span>${p.area} sq ft</span>
            </div>
          </div>
        </div>
      `).join(''),
      allProperties: allProperties.map(p => `
        <div class="property-card">
          <img src="${p.images[0]}" alt="${p.title}" class="property-image">
          <div class="property-info">
            <h3>${p.title}</h3>
            <p class="price">$${p.price.toLocaleString()}</p>
            <p class="location">${p.location}</p>
            <div class="property-details">
              <span>${p.beds} beds</span>
              <span>${p.baths} baths</span>
              <span>${p.area} sq ft</span>
            </div>
            <a href="/property/${p.id}" class="view-details">View Details</a>
          </div>
        </div>
      `).join('')
    };
    
    const html = renderTemplate(path.join(__dirname, 'templates', 'home.html'), homeData);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  },

  '/properties': (req, res) => {
    const propertiesData = {
      title: 'Properties - My Dream Property',
      properties: sampleProperties.map(p => `
        <div class="property-card">
          <img src="${p.images[0]}" alt="${p.title}" class="property-image">
          <div class="property-info">
            <h3>${p.title}</h3>
            <p class="description">${p.description.substring(0, 100)}...</p>
            <p class="price">$${p.price.toLocaleString()}</p>
            <p class="location">${p.location}</p>
            <div class="property-details">
              <span>${p.beds} beds</span>
              <span>${p.baths} baths</span>
              <span>${p.area} sq ft</span>
            </div>
            <a href="/property/${p.id}" class="view-details">View Details</a>
          </div>
        </div>
      `).join('')
    };
    
    const html = renderTemplate(path.join(__dirname, 'templates', 'properties.html'), propertiesData);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  },

  '/agents': (req, res) => {
    const agentsData = {
      title: 'Our Agents - My Dream Property',
      agents: sampleAgents.map(a => `
        <div class="agent-card">
          <img src="${a.image}" alt="${a.name}" class="agent-image">
          <div class="agent-info">
            <h3>${a.name}</h3>
            <p class="title">${a.title}</p>
            <p class="contact">${a.email}</p>
            <p class="contact">${a.contactNumber}</p>
            <div class="agent-stats">
              <span>Rating: ${a.rating}/5</span>
              <span>Deals: ${a.deals}</span>
            </div>
          </div>
        </div>
      `).join('')
    };
    
    const html = renderTemplate(path.join(__dirname, 'templates', 'agents.html'), agentsData);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  },

  '/contact': (req, res) => {
    const contactData = {
      title: 'Contact Us - My Dream Property'
    };
    
    const html = renderTemplate(path.join(__dirname, 'templates', 'contact.html'), contactData);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }
};

// API endpoints
const apiRoutes = {
  '/api/properties': (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(sampleProperties));
  },

  '/api/agents': (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(sampleAgents));
  },

  '/api/contact': (req, res) => {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const formData = JSON.parse(body);
          console.log('Contact form submission:', formData);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Message received successfully' }));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Invalid form data' }));
        }
      });
    } else {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Method not allowed' }));
    }
  }
};

// Static file handler
function serveStaticFile(req, res, filePath) {
  const extname = path.extname(filePath);
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Server error: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
}

// Main server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname;

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    if (apiRoutes[pathname]) {
      apiRoutes[pathname](req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'API endpoint not found' }));
    }
    return;
  }

  // Handle dynamic property routes
  if (pathname.startsWith('/property/')) {
    const propertyId = parseInt(pathname.split('/')[2]);
    const property = sampleProperties.find(p => p.id === propertyId);
    
    if (property) {
      const agent = sampleAgents.find(a => a.id === property.agentId);
      const propertyData = {
        title: `${property.title} - My Dream Property`,
        propertyTitle: property.title,
        propertyDescription: property.description,
        propertyPrice: `$${property.price.toLocaleString()}`,
        propertyLocation: property.location,
        propertyAddress: property.address,
        propertyBeds: property.beds,
        propertyBaths: property.baths,
        propertyArea: property.area,
        propertyType: property.propertyType,
        propertyImages: property.images.map(img => `<img src="${img}" alt="${property.title}" class="property-detail-image">`).join(''),
        agentName: agent ? agent.name : 'Unknown Agent',
        agentTitle: agent ? agent.title : '',
        agentEmail: agent ? agent.email : '',
        agentPhone: agent ? agent.contactNumber : '',
        agentImage: agent ? agent.image : ''
      };
      
      const html = renderTemplate(path.join(__dirname, 'templates', 'property-detail.html'), propertyData);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } else {
      res.writeHead(404);
      res.end('Property not found');
    }
    return;
  }

  // Handle main routes
  if (routes[pathname]) {
    routes[pathname](req, res);
    return;
  }

  // Handle static files
  if (pathname.startsWith('/static/')) {
    const filePath = path.join(__dirname, pathname);
    serveStaticFile(req, res, filePath);
    return;
  }

  // 404 for unmatched routes
  res.writeHead(404);
  res.end('Page not found');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Pure Node.js server running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});