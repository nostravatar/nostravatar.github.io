const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Random color generator
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Contrast function to determine text color
function getContrastColor(hexcolor) {
  if (!hexcolor || hexcolor === 'random') return '000000';
  
  // Convert hex to RGB
  const r = parseInt(hexcolor.substring(0, 2), 16);
  const g = parseInt(hexcolor.substring(2, 4), 16);
  const b = parseInt(hexcolor.substring(4, 6), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for bright colors, white for dark colors
  return luminance > 0.5 ? '000000' : 'FFFFFF';
}

// Get initials from name
function getInitials(name, length) {
  if (!name) return 'MR';
  
  const words = name.trim().split(/\s+/);
  let initials = '';

  for (let i = 0; i < words.length && initials.length < length; i++) {
    if (words[i][0]) {
      initials += words[i][0];
    }
  }
  
  // If we still don't have enough initials, repeat the first letter
  while (initials.length < length && name.length > 0) {
    initials += name[0];
  }
  
  return initials.substring(0, length);
}

// Add new utility functions
function generateGradient(color1, color2, type = 'linear') {
  return type === 'radial' 
    ? `radialGradient` 
    : `linearGradient`;
}

function generatePattern(type) {
  const patterns = {
    dots: '<pattern id="dots" patternUnits="userSpaceOnUse" width="20" height="20"><circle cx="10" cy="10" r="2" fill="#fff" opacity="0.3"/></pattern>',
    lines: '<pattern id="lines" patternUnits="userSpaceOnUse" width="20" height="20"><path d="M0 10h20" stroke="#fff" stroke-width="1" opacity="0.3"/></pattern>',
    grid: '<pattern id="grid" patternUnits="userSpaceOnUse" width="20" height="20"><path d="M0 10h20M10 0v20" stroke="#fff" stroke-width="1" opacity="0.3"/></pattern>',
    waves: '<pattern id="waves" patternUnits="userSpaceOnUse" width="40" height="20"><path d="M0 10c5-5 15-5 20 0s15 5 20 0" stroke="#fff" fill="none" stroke-width="1" opacity="0.3"/></pattern>'
  };
  return patterns[type] || '';
}

// Add new utility functions for enhanced graphics
function generateComplexGradient(type, colors) {
  if (type === 'radial') {
    return `
      <radialGradient id="grad" cx="50%" cy="50%" r="70%">
        ${colors.map((color, i) => 
          `<stop offset="${(i * 100) / (colors.length - 1)}%" style="stop-color:#${color}"/>`
        ).join('')}
      </radialGradient>`;
  }
  
  const directions = {
    'linear': 'x1="0%" y1="0%" x2="100%" y2="100%"',
    'horizontal': 'x1="0%" y1="50%" x2="100%" y2="50%"',
    'vertical': 'x1="50%" y1="0%" x2="50%" y2="100%"',
    'diagonal': 'x1="0%" y1="0%" x2="100%" y2="100%"'
  };

  return `
    <linearGradient id="grad" ${directions[type] || directions.linear}>
      ${colors.map((color, i) => 
        `<stop offset="${(i * 100) / (colors.length - 1)}%" style="stop-color:#${color}"/>`
      ).join('')}
    </linearGradient>`;
}

function generatePattern(type, color = 'fff', opacity = 0.3) {
  const patterns = {
    dots: `
      <pattern id="pattern" patternUnits="userSpaceOnUse" width="20" height="20">
        <circle cx="10" cy="10" r="2" fill="#${color}" opacity="${opacity}"/>
      </pattern>`,
    lines: `
      <pattern id="pattern" patternUnits="userSpaceOnUse" width="20" height="20">
        <path d="M0 10h20" stroke="#${color}" stroke-width="1" opacity="${opacity}"/>
      </pattern>`,
    grid: `
      <pattern id="pattern" patternUnits="userSpaceOnUse" width="20" height="20">
        <path d="M0 10h20M10 0v20" stroke="#${color}" stroke-width="1" opacity="${opacity}"/>
      </pattern>`,
    waves: `
      <pattern id="pattern" patternUnits="userSpaceOnUse" width="40" height="20">
        <path d="M0 10c5-5 15-5 20 0s15 5 20 0" stroke="#${color}" fill="none" stroke-width="1" opacity="${opacity}"/>
      </pattern>`,
    zigzag: `
      <pattern id="pattern" patternUnits="userSpaceOnUse" width="20" height="20">
        <path d="M0 0l10 10-10 10" stroke="#${color}" fill="none" stroke-width="1" opacity="${opacity}"/>
      </pattern>`,
    diamonds: `
      <pattern id="pattern" patternUnits="userSpaceOnUse" width="20" height="20">
        <path d="M10 0l10 10-10 10L0 10z" stroke="#${color}" fill="none" stroke-width="1" opacity="${opacity}"/>
      </pattern>`,
    circles: `
      <pattern id="pattern" patternUnits="userSpaceOnUse" width="40" height="40">
        <circle cx="20" cy="20" r="15" stroke="#${color}" fill="none" stroke-width="1" opacity="${opacity}"/>
      </pattern>`
  };
  return patterns[type] || '';
}

// Add text effects generator
function generateTextEffects(effect, color, size) {
  const effects = {
    shadow: `<filter id="shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.25"/>
    </filter>`,
    glow: `<filter id="glow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>`,
    outline: `<filter id="outline">
      <feMorphology operator="dilate" radius="2" in="SourceAlpha" result="thick"/>
      <feFlood flood-color="#${color}" result="color"/>
      <feComposite in="color" in2="thick" operator="in" result="outline"/>
      <feMerge>
        <feMergeNode in="outline"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>`,
    'double-outline': `<filter id="double-outline">
      <feMorphology operator="dilate" radius="3" in="SourceAlpha" result="thick"/>
      <feFlood flood-color="#${color}" result="color1"/>
      <feComposite in="color1" in2="thick" operator="in" result="outline1"/>
      <feMorphology operator="dilate" radius="1.5" in="SourceAlpha" result="medium"/>
      <feFlood flood-color="#fff" result="color2"/>
      <feComposite in="color2" in2="medium" operator="in" result="outline2"/>
      <feMerge>
        <feMergeNode in="outline1"/>
        <feMergeNode in="outline2"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>`
  };
  return effects[effect] || '';
}

// Add new banner-specific gradient generator
function generateBannerGradient(type, colors, animation = '') {
  const gradientDefs = {
    'linear': `
      <linearGradient id="grad" gradientTransform="rotate(${Math.random() * 360})">
        ${colors.map((color, i) => 
          `<stop offset="${(i * 100) / (colors.length - 1)}%" style="stop-color:#${color}">
            ${animation ? `<animate attributeName="stop-color" 
              values="#${color};#${colors[(i + 1) % colors.length]};#${color}" 
              dur="${3 + i}s" repeatCount="indefinite"/>` : ''}
          </stop>`
        ).join('')}
      </linearGradient>`,
    'radial': `
      <radialGradient id="grad" cx="50%" cy="50%" r="70%" fx="${30 + Math.random() * 40}%" fy="${30 + Math.random() * 40}%">
        ${colors.map((color, i) => 
          `<stop offset="${(i * 100) / (colors.length - 1)}%" style="stop-color:#${color}">
            ${animation ? `<animate attributeName="stop-color" 
              values="#${color};#${colors[(i + 1) % colors.length]};#${color}" 
              dur="${3 + i}s" repeatCount="indefinite"/>` : ''}
          </stop>`
        ).join('')}
      </radialGradient>`
  };
  return gradientDefs[type] || gradientDefs.linear;
}

// Add advanced gradient generator
function generateAdvancedGradient(config) {
    const {
        type = 'linear',
        colors = [],
        angle = 45,
        positions = [],
        animation = false
    } = config;

    const gradientStops = colors.map((color, i) => `
        <stop offset="${positions[i] || (i * 100 / (colors.length - 1))}%" 
              style="stop-color:#${color}">
            ${animation ? `
                <animate attributeName="stop-color"
                         values="#${color};#${colors[(i + 1) % colors.length]};#${color}"
                         dur="${3 + i}s"
                         repeatCount="indefinite"/>
            ` : ''}
        </stop>
    `).join('');

    return `
        <${type}Gradient id="gradient" ${type === 'linear' ? 
            `gradientTransform="rotate(${angle})"` : 
            'cx="50%" cy="50%" r="70%" fx="30%" fy="30%"'}>
            ${gradientStops}
        </${type}Gradient>
    `;
}

// Add enhanced pattern generator
function generateEnhancedPattern(config) {
    const {
        type,
        color = 'fff',
        opacity = 0.3,
        size = 20,
        rotation = 0
    } = config;

    // Add new pattern types
    const patterns = {
        dots: `
            <pattern id="pattern" patternUnits="userSpaceOnUse" width="${size}" height="${size}" patternTransform="rotate(${rotation})">
                <circle cx="${size / 2}" cy="${size / 2}" r="${size / 4}" fill="#${color}" opacity="${opacity}"/>
            </pattern>
        `,
        lines: `
            <pattern id="pattern" patternUnits="userSpaceOnUse" width="${size}" height="${size}" patternTransform="rotate(${rotation})">
                <path d="M0 ${size / 2}h${size}" stroke="#${color}" stroke-width="1" opacity="${opacity}"/>
            </pattern>
        `,
        grid: `
            <pattern id="pattern" patternUnits="userSpaceOnUse" width="${size}" height="${size}" patternTransform="rotate(${rotation})">
                <path d="M0 ${size / 2}h${size}M${size / 2} 0v${size}" stroke="#${color}" stroke-width="1" opacity="${opacity}"/>
            </pattern>
        `,
        waves: `
            <pattern id="pattern" patternUnits="userSpaceOnUse" width="${size * 2}" height="${size}" patternTransform="rotate(${rotation})">
                <path d="M0 ${size / 2}c${size / 4}-${size / 4} ${size * 3 / 4}-${size / 4} ${size}-${size / 2}s${size * 3 / 4} ${size / 4} ${size} 0" stroke="#${color}" fill="none" stroke-width="1" opacity="${opacity}"/>
            </pattern>
        `,
        zigzag: `
            <pattern id="pattern" patternUnits="userSpaceOnUse" width="${size}" height="${size}" patternTransform="rotate(${rotation})">
                <path d="M0 0l${size / 2} ${size / 2}-${size / 2} ${size / 2}" stroke="#${color}" fill="none" stroke-width="1" opacity="${opacity}"/>
            </pattern>
        `,
        diamonds: `
            <pattern id="pattern" patternUnits="userSpaceOnUse" width="${size}" height="${size}" patternTransform="rotate(${rotation})">
                <path d="M${size / 2} 0l${size / 2} ${size / 2}-${size / 2} ${size / 2}-${size / 2}-${size / 2}z" stroke="#${color}" fill="none" stroke-width="1" opacity="${opacity}"/>
            </pattern>
        `,
        circles: `
            <pattern id="pattern" patternUnits="userSpaceOnUse" width="${size * 2}" height="${size * 2}" patternTransform="rotate(${rotation})">
                <circle cx="${size}" cy="${size}" r="${size * 0.75}" stroke="#${color}" fill="none" stroke-width="1" opacity="${opacity}"/>
            </pattern>
        `,
        hexagons: `
            <pattern id="pattern" patternUnits="userSpaceOnUse" 
                     width="${size * 2}" height="${size * 1.73}" 
                     patternTransform="rotate(${rotation})">
                <path d="M${size},0 L${size * 2},${size * 0.87} L${size * 2},${size * 1.73} L${size},${size * 1.73} L0,${size * 0.87} L0,0 Z"
                      fill="none" stroke="#${color}" stroke-width="1" opacity="${opacity}"/>
            </pattern>
        `,
        squares: `
            <pattern id="pattern" patternUnits="userSpaceOnUse"
                     width="${size}" height="${size}"
                     patternTransform="rotate(${rotation})">
                <rect width="${size * 0.8}" height="${size * 0.8}"
                      x="${size * 0.1}" y="${size * 0.1}"
                      fill="none" stroke="#${color}" 
                      stroke-width="1" opacity="${opacity}"/>
            </pattern>
        `,
        triangles: `
            <pattern id="pattern" patternUnits="userSpaceOnUse" width="${size}" height="${size}"
                     patternTransform="rotate(${rotation})">
                <path d="M${size/2} 0 L${size} ${size} L0 ${size}Z"
                      fill="none" stroke="#${color}" stroke-width="1" opacity="${opacity}"/>
            </pattern>
        `,
        stars: `
            <pattern id="pattern" patternUnits="userSpaceOnUse" width="${size*2}" height="${size*2}"
                     patternTransform="rotate(${rotation})">
                <path d="M${size} 0 L${size*1.3} ${size*0.8} L${size*2} ${size} L${size*1.3} ${size*1.2} L${size} ${size*2} L${size*0.7} ${size*1.2} L0 ${size} L${size*0.7} ${size*0.8}Z"
                      fill="none" stroke="#${color}" stroke-width="1" opacity="${opacity}"/>
            </pattern>
        `,
        crosshatch: `
            <pattern id="pattern" patternUnits="userSpaceOnUse" width="${size}" height="${size}"
                     patternTransform="rotate(${rotation})">
                <path d="M0 0L${size} ${size} M${size} 0L0 ${size}"
                      stroke="#${color}" stroke-width="1" opacity="${opacity}"/>
            </pattern>
        `
    };

    return patterns[type] || '';
}

// Add new text effects
function getTextEffects(color = '000000') {
    return {
        shadow: `<filter id="shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.25"/>
        </filter>`,
        glow: `<filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>`,
        outline: `<filter id="outline">
            <feMorphology operator="dilate" radius="2" in="SourceAlpha" result="thick"/>
            <feFlood flood-color="#${color}" result="color"/>
            <feComposite in="color" in2="thick" operator="in" result="outline"/>
            <feMerge>
                <feMergeNode in="outline"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>`,
        'double-outline': `<filter id="double-outline">
            <feMorphology operator="dilate" radius="3" in="SourceAlpha" result="thick"/>
            <feFlood flood-color="#${color}" result="color1"/>
            <feComposite in="color1" in2="thick" operator="in" result="outline1"/>
            <feMorphology operator="dilate" radius="1.5" in="SourceAlpha" result="medium"/>
            <feFlood flood-color="#fff" result="color2"/>
            <feComposite in="color2" in2="medium" operator="in" result="outline2"/>
            <feMerge>
                <feMergeNode in="outline1"/>
                <feMergeNode in="outline2"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>`,
        'metallic': `
            <filter id="metallic">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
                <feSpecularLighting in="blur" surfaceScale="5" specularConstant=".75" 
                                specularExponent="20" lighting-color="#bbbbbb"  
                                result="highlight">
                    <fePointLight x="-5000" y="-10000" z="20000"/>
                </feSpecularLighting>
                <feComposite in="highlight" in2="SourceAlpha" operator="in" result="highlight"/>
                <feComposite in="SourceGraphic" in2="highlight" operator="arithmetic" 
                            k1="0" k2="1" k3="1" k4="0"/>
            </filter>
        `,
        'neon': `
            <filter id="neon">
                <feFlood flood-color="#00ff00" flood-opacity="0.5" result="flood"/>
                <feComposite operator="in" in="flood" in2="SourceGraphic" result="comp"/>
                <feGaussianBlur in="comp" stdDeviation="3" result="blur"/>
                <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        `,
        'chrome': `
            <filter id="chrome">
                <feFlood flood-color="#${color}" result="flood"/>
                <feComposite operator="in" in="flood" in2="SourceAlpha"/>
                <feGaussianBlur stdDeviation="1" result="blur"/>
                <feSpecularLighting surfaceScale="5" specularConstant="1.5" specularExponent="20" result="spec"
                                  in="blur">
                    <fePointLight x="-100" y="-100" z="200"/>
                </feSpecularLighting>
                <feComposite operator="in" in="spec" in2="SourceAlpha"/>
                <feComposite operator="over" in="SourceGraphic"/>
            </filter>
        `,
        'retro': `
            <filter id="retro">
                <feColorMatrix type="matrix" values="
                    0.94 0 0 0 0
                    0 0.85 0 0 0
                    0 0 0.5 0 0
                    0 0 0 1 0"/>
                <feMorphology operator="dilate" radius="1"/>
                <feOffset dx="2" dy="2"/>
            </filter>
        `,
        'paint': `
            <filter id="paint">
                <feTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="3"/>
                <feDisplacementMap in="SourceGraphic" scale="5"/>
            </filter>
        `,
        'vintage': `
            <filter id="vintage">
                <feColorMatrix type="matrix" values="
                    0.7 0.3 0.3 0 0
                    0.2 0.7 0.2 0 0
                    0.2 0.2 0.7 0 0
                    0 0 0 1 0"/>
                <feGaussianBlur stdDeviation="0.5"/>
            </filter>
        `
    };
}

// Add new advanced animations
function getAnimationEffects() {
    return {
        float: `
            @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
        `,
        pulse: `
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
        `,
        rotate: `
            @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `,
        shake: `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
        `,
        bounce: `
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-20px); }
                60% { transform: translateY(-10px); }
            }
        `,
        glitch: `
            @keyframes glitch {
                0% { transform: translate(0); }
                20% { transform: translate(-5px, 5px); }
                40% { transform: translate(-5px, -5px); }
                60% { transform: translate(5px, 5px); }
                80% { transform: translate(5px, -5px); }
                100% { transform: translate(0); }
            }
        `,
        ripple: `
            @keyframes ripple {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.5); opacity: 0.5; }
                100% { transform: scale(2); opacity: 0; }
            }
        `,
        swing: `
            @keyframes swing {
                0%, 100% { transform: rotate(0deg); }
                20% { transform: rotate(15deg); }
                40% { transform: rotate(-10deg); }
                60% { transform: rotate(5deg); }
                80% { transform: rotate(-5deg); }
            }
        `
    };
}

// Update main API endpoint to handle both modes
app.get('/api', (req, res) => {
  try {
    const mode = req.query.mode || 'avatar';
    
    if (mode === 'banner') {
      // Banner specific parameters
      const size = Math.min(2048, Math.max(16, parseInt(req.query.size) || 300));
      const ratio = req.query.ratio || '16:9';
      const [w, h] = ratio.split(':').map(Number);
      const width = size * w;
      const height = size * h;
      const gradientType = req.query.gradient || 'linear';
      const colors = (req.query.colors || '').split(',').filter(Boolean);
      const pattern = req.query.pattern || '';
      const animation = req.query.animation || '';
      const wave = req.query.wave === 'true';
      const pulse = req.query.pulse === 'true';

      // Add animation class for banners
      const animationStyle = animation ? `
        <style>
          ${getAnimationEffects()[animation]}
          .animated-banner { animation: ${animation} ${req.query.duration || '3s'} ${req.query.timing || 'ease-in-out'} infinite; }
        </style>
      ` : '';

      // Create banner SVG
      const svgContent = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" ${animation ? 'class="animated-banner"' : ''}>
          <defs>
            ${animationStyle}
            ${generateBannerGradient(gradientType, colors.length ? colors : [getRandomColor(), getRandomColor()], animation === 'color')}
            ${pattern ? generatePattern(pattern, 'fff', 0.2) : ''}
            ${wave ? `
              <animate attributeName="viewBox" dur="10s" repeatCount="indefinite"
                values="0 0 ${width} ${height};
                        ${width * 0.1} ${height * 0.1} ${width * 0.8} ${height * 0.8};
                        0 0 ${width} ${height}"
                calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"/>
            ` : ''}
          </defs>

          <rect width="100%" height="100%" fill="url(#grad)" ${pulse ? `>
            <animate attributeName="opacity" values="1;0.8;1" dur="2s" repeatCount="indefinite"/>
          </rect>` : '/>'}
          
          ${pattern ? `<rect width="100%" height="100%" fill="url(#pattern)"/>` : ''}
        </svg>
      `;

      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(svgContent);
      return;
    }

    // Avatar specific parameters
    const name = req.query.name || 'John Doe';
    const size = Math.min(512, Math.max(16, parseInt(req.query.size) || 64));
    const fontSize = Math.min(1, Math.max(0.1, parseFloat(req.query['font-size']) || 0.5));
    const length = Math.max(1, parseInt(req.query.length) || 2);
    let background = req.query.background || 'f0e9e9';
    const color = req.query.color || '';
    const rounded = req.query.rounded === 'true';
    const bold = req.query.bold === 'true';
    const uppercase = req.query.uppercase !== 'false';
    const gradientType = req.query.gradient || '';
    const gradientColor1 = req.query['gradient-color1'] || background;
    const gradientColor2 = req.query['gradient-color2'] || getRandomColor();
    const pattern = req.query.pattern || '';
    const shadow = req.query.shadow === 'true';
    const animation = req.query.animation || '';
    const textEffect = req.query.textEffect || '';

    // Handle random background
    if (background === 'random') {
      background = getRandomColor();
    }

    // Calculate dimensions
    const width = size;
    const height = size;

    // Get initials
    let initials = getInitials(name, length);
    if (uppercase) {
      initials = initials.toUpperCase();
    }
    
    // Determine text color
    const textColor = color || getContrastColor(background);

    // Add animation class for avatars
    const animationStyle = animation ? `
      <style>
        ${getAnimationEffects()[animation]}
        .animated-avatar { animation: ${animation} ${req.query.duration || '3s'} ${req.query.timing || 'ease-in-out'} infinite; }
      </style>
    ` : '';

    // Create avatar SVG
    const svgContent = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" ${animation ? 'class="animated-avatar"' : ''}>
        <defs>
          ${animationStyle}
          ${gradientType ? `
            <${generateGradient(gradientType)} id="grad" ${gradientType === 'radial' ? 'cx="50%" cy="50%" r="50%"' : 'x1="0%" y1="0%" x2="100%" y2="100%"'}>
              <stop offset="0%" style="stop-color:#${gradientColor1}"/>
              <stop offset="100%" style="stop-color:#${gradientColor2}"/>
            </${generateGradient(gradientType)}>
          ` : ''}
          ${pattern ? generatePattern(pattern) : ''}
          ${shadow ? `
            <filter id="shadow">
              <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.25"/>
            </filter>
          ` : ''}
          ${textEffect ? getTextEffects(textColor)[textEffect] || '' : ''}
        </defs>

        ${rounded ? 
          `<circle cx="${width/2}" cy="${height/2}" r="${Math.min(width, height)/2}" fill="${gradientType ? 'url(#grad)' : `#${background}`}" />` : 
          `<rect width="${width}" height="${height}" fill="${gradientType ? 'url(#grad)' : `#${background}`}" />`
        }
        ${pattern ? `<rect width="${width}" height="${height}" fill="url(#pattern)" />` : ''}
        
        ${animation ? `<style>
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          .animated-text { animation: ${animation} 3s ease-in-out infinite; }
        </style>` : ''}

        <text x="${width/2}" y="${height/2}" 
          font-family="Arial, sans-serif" 
          font-size="${fontSize * Math.min(width, height)}px" 
          ${bold ? 'font-weight="bold"' : ''} 
          fill="#${textColor}" 
          text-anchor="middle" 
          dominant-baseline="central"
          ${shadow ? 'filter="url(#shadow)"' : ''}
          ${animation ? 'class="animated-text"' : ''}>
          ${textEffect === 'outline' ? `
            <tspan stroke="#${background}" stroke-width="4" fill="none">${initials}</tspan>
          ` : ''}
          ${initials}
        </text>
      </svg>
    `;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svgContent);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error generating image');
  }
});

// Add new examples route with responsive design
app.get('/examples', (req, res) => {
  const examples = {
    banners: [
      { name: 'Gradient Banner', url: '/api?mode=banner&gradient=linear&colors=2196F3,21CBF3&size=300' },
      { name: 'Animated Banner', url: '/api?mode=banner&gradient=radial&colors=722ed1,f5222d,fa8c16&animation=color&size=300' },
      { name: 'Wave Effect', url: '/api?mode=banner&gradient=linear&colors=1890ff,36cfc9&wave=true&size=300' },
      { name: 'Pattern Overlay', url: '/api?mode=banner&gradient=linear&colors=722ed1,f5222d&pattern=dots&size=300' },
      { name: 'Pulse Effect', url: '/api?mode=banner&gradient=radial&colors=ff4d4f,ff7875&pulse=true&size=300' },
      { name: 'Animated Pulse', url: '/api?mode=banner&gradient=radial&colors=722ed1,f5222d&animation=pulse&size=300&ratio=16:9' },
      { name: 'Floating Banner', url: '/api?mode=banner&gradient=linear&colors=1890ff,36cfc9&animation=float&size=300&ratio=16:9' },
      { name: 'Glitch Effect', url: '/api?mode=banner&gradient=linear&colors=ff4d4f,ff7875&animation=glitch&size=300&ratio=16:9' },
      { name: 'Ripple Effect', url: '/api?mode=banner&gradient=radial&colors=13c2c2,36cfc9&animation=ripple&size=300&ratio=16:9' }
    ],
    avatars: [
      { name: 'Simple Avatar', url: '/api?name=John+Doe' },
      { name: 'Rounded Blue', url: '/api?name=Sarah&background=2196F3&color=fff&rounded=true' },
      { name: 'Wide Banner', url: '/api?name=Company+Name&mode=banner&ratio=3:1&size=200&gradient=horizontal&gradient-colors=2196F3,21CBF3&pattern=waves' },
      { name: 'HD Banner', url: '/api?name=Premium&mode=banner&ratio=16:9&size=120&gradient=radial&gradient-colors=722ed1,f5222d,fa8c16&textEffect=double-outline' },
      { name: 'Rainbow Gradient', url: '/api?gradient=linear&gradient-colors=ff0000,ff8c00,ffff00,00ff00,00ffff,0000ff,ff00ff' },
      { name: 'Sunset Gradient', url: '/api?gradient=vertical&gradient-colors=ff512f,dd2476&pattern=circles' },
      { name: 'Diamond Pattern', url: '/api?background=1890ff&pattern=diamonds&pattern-color=fff&pattern-opacity=0.2' },
      { name: 'Wave Pattern', url: '/api?background=722ed1&pattern=waves&pattern-color=fff&pattern-opacity=0.3' },
      { name: 'Glowing Text', url: '/api?name=Glow&background=000000&color=ffffff&textEffect=glow' },
      { name: 'Double Outline', url: '/api?name=Outline&background=ff4d4f&textEffect=double-outline' },
      { name: 'Floating', url: '/api?name=Float&animation=float&textEffect=shadow' },
      { name: 'Pulsing', url: '/api?name=Pulse&animation=pulse&gradient=radial&gradient-colors=13c2c2,36cfc9,87e8de' },
      { name: 'Chrome Effect', url: '/api?name=Chrome&textEffect=chrome&background=gradient&gradient-colors=4B0082,800080' },
      { name: 'Retro Style', url: '/api?name=Retro&textEffect=retro&background=F4A460' },
      { name: 'Paint Effect', url: '/api?name=Paint&textEffect=paint&background=4682B4' },
      { name: 'Vintage Look', url: '/api?name=Vintage&textEffect=vintage&background=DEB887' },
      { name: 'Stars Pattern', url: '/api?background=4B0082&pattern=stars&pattern-color=fff' },
      { name: 'Triangles', url: '/api?background=2F4F4F&pattern=triangles&pattern-color=fff' },
      { name: 'Crosshatch', url: '/api?background=8B4513&pattern=crosshatch&pattern-color=fff' },
      { name: 'Bounce Avatar', url: '/api?name=John&animation=bounce&size=100' },
      { name: 'Rotate Avatar', url: '/api?name=Sarah&animation=rotate&background=2196F3&size=100' },
      { name: 'Swing Avatar', url: '/api?name=Mike&animation=swing&background=722ed1&size=100' },
      { name: 'Shake Avatar', url: '/api?name=Lisa&animation=shake&background=ff4d4f&size=100' },
      { name: 'Glitch Avatar', url: '/api?name=Alex&animation=glitch&background=13c2c2&size=100' }
    ]
  };

  res.send(`
    <html>
      <head>
        <title>Image Generator Examples</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: system-ui;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
          }
          
          .container {
            max-width: 1400px;
            margin: 0 auto;
          }

          .tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
          }

          .tab {
            padding: 10px 20px;
            background: #fff;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s;
          }

          .tab.active {
            background: #1890ff;
            color: white;
          }

          .gallery {
            display: grid;
            gap: 15px;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          }

          .example {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: all 0.2s ease;
          }

          .example:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          }

          .example img {
            width: 100%;
            height: 150px;
            object-fit: cover;
            display: block;
          }

          .example-info {
            padding: 15px;
          }

          .example-info h3 {
            margin: 0 0 10px;
            font-size: 18px;
          }

          .copy-button {
            background: #1890ff;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            width: 100%;
            transition: background 0.3s;
          }

          .copy-button:hover {
            background: #40a9ff;
          }

          @media (max-width: 768px) {
            .gallery {
              grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            }
          }

          @media (max-width: 480px) {
            .gallery {
              grid-template-columns: 1fr;
            }
          }

          .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #52c41a;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            transform: translateY(100px);
            transition: transform 0.3s;
          }

          .notification.show {
            transform: translateY(0);
          }

          .dark-mode {
            background: #1f1f1f;
            color: #fff;
          }

          .dark-mode .example {
            background: #2d2d2d;
            color: #fff;
          }

          .dark-mode .tab {
            background: #2d2d2d;
            color: #fff;
          }

          .dark-mode .tab.active {
            background: #1890ff;
          }

          .theme-toggle {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px;
            border-radius: 50%;
            background: #1890ff;
            color: white;
            border: none;
            cursor: pointer;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Image Generator Examples</h1>
          
          <div class="tabs">
            <button class="tab active" onclick="showTab('banners')">Banners</button>
            <button class="tab" onclick="showTab('avatars')">Avatars</button>
          </div>

          <div id="banners" class="gallery">
            ${examples.banners.map(ex => `
              <div class="example">
                <img src="${ex.url}" alt="${ex.name}">
                <div class="example-info">
                  <h3>${ex.name}</h3>
                  <button class="copy-button" onclick="copyUrl('${ex.url}')">Copy URL</button>
                </div>
              </div>
            `).join('')}
          </div>

          <div id="avatars" class="gallery" style="display: none">
            ${examples.avatars.map(ex => `
              <div class="example">
                <img src="${ex.url}" alt="${ex.name}">
                <div class="example-info">
                  <h3>${ex.name}</h3>
                  <button class="copy-button" onclick="copyUrl('${ex.url}')">Copy URL</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="notification" id="notification">URL copied to clipboard!</div>
        <button class="theme-toggle" onclick="toggleTheme()">🌓</button>
        <script>
          function showTab(tabName) {
            document.querySelectorAll('.gallery').forEach(g => g.style.display = 'none');
            document.getElementById(tabName).style.display = 'grid';
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            event.target.classList.add('active');
          }

          function copyUrl(url) {
            navigator.clipboard.writeText(window.location.origin + url).then(() => {
              const notification = document.getElementById('notification');
              notification.classList.add('show');
              setTimeout(() => notification.classList.remove('show'), 2000);
            });
          }

          function toggleTheme() {
            document.body.classList.toggle('dark-mode');
          }
        </script>
      </body>
    </html>
  `);
});

// Documentation route
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Avatar Generator API</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; max-width: 800px; margin: 0 auto; }
          h1 { color: #333; }
          code { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; }
          .example { margin: 10px 0; }
          .example img { margin-right: 10px; vertical-align: middle; }
        </style>
      </head>
      <body>
        <h1>Avatar Generator API</h1>
        <p>Generate avatars with initials from names.</p>
        
        <h2>Usage</h2>
        <p>All requests return an SVG image to be used directly in an &lt;img/&gt; tag.</p>
        
        <div class="example">
          <p>Basic usage: <code>http://localhost:${PORT}/api?name=John+Doe</code></p>
          <img src="/api?name=John+Doe" alt="John Doe" />
        </div>
        
        <h2>Parameters</h2>
        <ul>
          <li><strong>name</strong>: The name used to generate initials (default: "John Doe")</li>
          <li><strong>size</strong>: Avatar image size in pixels. Between 16 and 512 (default: 64)</li>
          <li><strong>font-size</strong>: Font size in percentage of size. Between 0.1 and 1 (default: 0.5)</li>
          <li><strong>length</strong>: Length of the generated initials (default: 2)</li>
          <li><strong>background</strong>: Hex color for image background, without the hash (#) (default: f0e9e9) or "random"</li>
          <li><strong>color</strong>: Hex color for the font, without the hash (#) (default: auto contrast)</li>
          <li><strong>rounded</strong>: Boolean specifying if the returned image should be a circle (default: false)</li>
          <li><strong>bold</strong>: Boolean specifying if the returned letters should use a bold font (default: false)</li>
          <li><strong>uppercase</strong>: Decide if the API should uppercase the initials (default: true)</li>
          <li><strong>gradient</strong>: Type of gradient background (linear or radial)</li>
          <li><strong>gradient-color1</strong>: First color for gradient background</li>
          <li><strong>gradient-color2</strong>: Second color for gradient background</li>
          <li><strong>pattern</strong>: Background pattern (dots, lines, grid, waves)</li>
          <li><strong>shadow</strong>: Boolean specifying if the text should have a shadow (default: false)</li>
          <li><strong>animation</strong>: Animation type for text (float, pulse)</li>
          <li><strong>textEffect</strong>: Text effect (outline)</li>
          <li><strong>mode</strong>: Mode of the image (avatar, banner)</li>
          <li><strong>ratio</strong>: Ratio for banner mode (default: 1:1)</li>
        </ul>
        
        <h2>Examples</h2>
        <div class="example">
          <p>Blue background: <code>/api?background=0D8ABC&color=fff&name=John+Doe</code></p>
          <img src="/api?background=0D8ABC&color=fff&name=John+Doe" alt="Blue Background" />
        </div>
        
        <div class="example">
          <p>Random background: <code>/api?background=random&name=John+Doe</code></p>
          <img src="/api?background=random&name=John+Doe" alt="Random Background" />
        </div>
        
        <div class="example">
          <p>Rounded: <code>/api?rounded=true&name=John+Doe&size=80</code></p>
          <img src="/api?rounded=true&name=John+Doe&size=80" alt="Rounded" />
        </div>
        
        <div class="example">
          <p>One letter: <code>/api?length=1&name=John+Doe</code></p>
          <img src="/api?length=1&name=John+Doe" alt="One Letter" />
        </div>
      </body>
    </html>
  `);
});

// Serve the generator page
app.get('/generator', (req, res) => {
    res.sendFile(path.join(__dirname, 'generator.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Avatar Generator API running on port ${PORT}`);
  console.log(`Access it at http://localhost:${PORT}`);
});
