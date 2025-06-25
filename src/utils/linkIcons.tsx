import React from 'react';
import { Link, FileText, Calendar, MessageSquare, Mail, Video, File, Users, BookOpen, FileSpreadsheet, Presentation, Image, FileCode, FileArchive, FileAudio, FileVideo, Globe, Database, ShoppingCart, CreditCard, MapPin, Phone, Camera, Music, Gamepad2, Heart, Zap, Shield, Lock, Unlock, Star, TrendingUp, BarChart3, PieChart, Activity, Target, Award, Trophy, Briefcase, Building2, Home, Car, Plane, Train, Bus, Ship, Bike, Coffee, Utensils, ShoppingBag, Gift, DollarSign, Euro, Coins, Wallet, PiggyBank, Banknote, Receipt, Calculator, Clock, Timer, CalendarDays, CalendarCheck, CalendarX, CalendarPlus, CalendarMinus, CalendarRange, CalendarSearch, CalendarHeart, CalendarClock, CalendarOff, Cloud, Archive, Apple, Bitcoin } from 'lucide-react';

// Enhanced map of domain patterns to their corresponding icons
export const domainIcons: { [key: string]: React.ReactNode } = {
  // Google Services
  'docs.google.com': <FileText className="text-blue-500" size={24} />,
  'calendar.google.com': <Calendar className="text-blue-500" size={24} />,
  'mail.google.com': <Mail className="text-blue-500" size={24} />,
  'meet.google.com': <Video className="text-blue-500" size={24} />,
  'drive.google.com': <File className="text-blue-500" size={24} />,
  'sheets.google.com': <FileSpreadsheet className="text-blue-500" size={24} />,
  'slides.google.com': <Presentation className="text-blue-500" size={24} />,
  'forms.google.com': <FileText className="text-blue-500" size={24} />,
  'sites.google.com': <Globe className="text-blue-500" size={24} />,
  'keep.google.com': <FileText className="text-blue-500" size={24} />,
  'photos.google.com': <Image className="text-blue-500" size={24} />,
  'maps.google.com': <MapPin className="text-blue-500" size={24} />,
  'translate.google.com': <Globe className="text-blue-500" size={24} />,
  'analytics.google.com': <BarChart3 className="text-blue-500" size={24} />,
  'search.google.com': <Globe className="text-blue-500" size={24} />,
  'console.google.com': <Database className="text-blue-500" size={24} />,
  'cloud.google.com': <Cloud className="text-blue-500" size={24} />,
  
  // Microsoft Services
  'teams.microsoft.com': <Users className="text-blue-600" size={24} />,
  'outlook.office.com': <Mail className="text-blue-600" size={24} />,
  'office.com': <FileText className="text-blue-600" size={24} />,
  'onedrive.live.com': <File className="text-blue-600" size={24} />,
  'sharepoint.com': <FileText className="text-blue-600" size={24} />,
  'azure.microsoft.com': <Cloud className="text-blue-600" size={24} />,
  'portal.azure.com': <Cloud className="text-blue-600" size={24} />,
  'dev.azure.com': <FileCode className="text-blue-600" size={24} />,
  'visualstudio.com': <FileCode className="text-blue-600" size={24} />,
  'powerbi.com': <BarChart3 className="text-blue-600" size={24} />,
  'dynamics.com': <Database className="text-blue-600" size={24} />,
  
  // Communication & Collaboration
  'slack.com': <MessageSquare className="text-purple-500" size={24} />,
  'discord.com': <MessageSquare className="text-indigo-500" size={24} />,
  'zoom.us': <Video className="text-blue-500" size={24} />,
  'webex.com': <Video className="text-blue-600" size={24} />,
  'skype.com': <Video className="text-blue-500" size={24} />,
  'whatsapp.com': <MessageSquare className="text-green-500" size={24} />,
  'telegram.org': <MessageSquare className="text-blue-500" size={24} />,
  'signal.org': <MessageSquare className="text-green-600" size={24} />,
  
  // Productivity & Documentation
  'notion.so': <BookOpen className="text-black" size={24} />,
  'figma.com': <Image className="text-purple-500" size={24} />,
  'miro.com': <Image className="text-blue-500" size={24} />,
  'whimsical.com': <Image className="text-purple-500" size={24} />,
  'trello.com': <FileText className="text-blue-500" size={24} />,
  'asana.com': <Target className="text-purple-500" size={24} />,
  'monday.com': <Calendar className="text-red-500" size={24} />,
  'clickup.com': <Target className="text-purple-600" size={24} />,
  'airtable.com': <Database className="text-blue-500" size={24} />,
  'confluence.atlassian.com': <BookOpen className="text-blue-500" size={24} />,
  'jira.atlassian.com': <Target className="text-blue-500" size={24} />,
  'linear.app': <Target className="text-purple-500" size={24} />,
  'basecamp.com': <Users className="text-green-500" size={24} />,
  
  // Development & Code
  'github.com': <FileCode className="text-black" size={24} />,
  'gitlab.com': <FileCode className="text-orange-500" size={24} />,
  'bitbucket.org': <FileCode className="text-blue-500" size={24} />,
  'stackoverflow.com': <FileCode className="text-orange-500" size={24} />,
  'codepen.io': <FileCode className="text-black" size={24} />,
  'jsfiddle.net': <FileCode className="text-blue-500" size={24} />,
  'replit.com': <FileCode className="text-orange-500" size={24} />,
  'codesandbox.io': <FileCode className="text-black" size={24} />,
  'vercel.com': <Zap className="text-black" size={24} />,
  'netlify.com': <Zap className="text-green-500" size={24} />,
  'heroku.com': <Cloud className="text-purple-500" size={24} />,
  'aws.amazon.com': <Cloud className="text-orange-500" size={24} />,
  'digitalocean.com': <Cloud className="text-blue-500" size={24} />,
  'cloudflare.com': <Shield className="text-orange-500" size={24} />,
  
  // Storage & File Sharing
  'dropbox.com': <FileArchive className="text-blue-500" size={24} />,
  'box.com': <FileArchive className="text-blue-500" size={24} />,
  'mega.nz': <FileArchive className="text-red-500" size={24} />,
  'pcloud.com': <FileArchive className="text-blue-500" size={24} />,
  'icloud.com': <Cloud className="text-blue-500" size={24} />,
  
  // Social Media
  'linkedin.com': <Users className="text-blue-600" size={24} />,
  'twitter.com': <MessageSquare className="text-blue-400" size={24} />,
  'facebook.com': <Users className="text-blue-600" size={24} />,
  'instagram.com': <Camera className="text-pink-500" size={24} />,
  'youtube.com': <FileVideo className="text-red-500" size={24} />,
  'vimeo.com': <FileVideo className="text-blue-500" size={24} />,
  'tiktok.com': <FileVideo className="text-black" size={24} />,
  'reddit.com': <MessageSquare className="text-orange-500" size={24} />,
  'pinterest.com': <Image className="text-red-500" size={24} />,
  'snapchat.com': <Camera className="text-yellow-400" size={24} />,
  
  // Entertainment & Media
  'spotify.com': <Music className="text-green-500" size={24} />,
  'apple.com': <Apple className="text-black" size={24} />,
  'netflix.com': <FileVideo className="text-red-600" size={24} />,
  'disneyplus.com': <FileVideo className="text-blue-600" size={24} />,
  'hulu.com': <FileVideo className="text-green-500" size={24} />,
  'amazon.com': <ShoppingCart className="text-orange-500" size={24} />,
  'steam.com': <Gamepad2 className="text-blue-600" size={24} />,
  'twitch.tv': <FileVideo className="text-purple-500" size={24} />,
  
  // E-commerce & Shopping
  'shopify.com': <ShoppingCart className="text-green-500" size={24} />,
  'woocommerce.com': <ShoppingCart className="text-purple-500" size={24} />,
  'etsy.com': <ShoppingBag className="text-orange-500" size={24} />,
  'ebay.com': <ShoppingCart className="text-red-500" size={24} />,
  'walmart.com': <ShoppingCart className="text-blue-500" size={24} />,
  'target.com': <Target className="text-red-500" size={24} />,
  'bestbuy.com': <ShoppingCart className="text-blue-500" size={24} />,
  
  // Finance & Banking
  'paypal.com': <CreditCard className="text-blue-500" size={24} />,
  'stripe.com': <CreditCard className="text-purple-500" size={24} />,
  'square.com': <CreditCard className="text-green-500" size={24} />,
  'coinbase.com': <Bitcoin className="text-blue-500" size={24} />,
  'binance.com': <Bitcoin className="text-yellow-500" size={24} />,
  'robinhood.com': <TrendingUp className="text-green-500" size={24} />,
  'fidelity.com': <TrendingUp className="text-green-600" size={24} />,
  'vanguard.com': <TrendingUp className="text-blue-600" size={24} />,
  
  // Travel & Transportation
  'booking.com': <Building2 className="text-blue-500" size={24} />,
  'airbnb.com': <Home className="text-pink-500" size={24} />,
  'expedia.com': <Plane className="text-blue-500" size={24} />,
  'kayak.com': <Plane className="text-blue-500" size={24} />,
  'uber.com': <Car className="text-black" size={24} />,
  'lyft.com': <Car className="text-pink-500" size={24} />,
  'waze.com': <MapPin className="text-blue-500" size={24} />,
  
  // Food & Dining
  'doordash.com': <Utensils className="text-red-500" size={24} />,
  'ubereats.com': <Utensils className="text-black" size={24} />,
  'grubhub.com': <Utensils className="text-red-500" size={24} />,
  'postmates.com': <Utensils className="text-blue-500" size={24} />,
  'yelp.com': <Utensils className="text-red-500" size={24} />,
  'opentable.com': <Utensils className="text-blue-500" size={24} />,
  
  // Health & Fitness
  'fitbit.com': <Activity className="text-pink-500" size={24} />,
  'myfitnesspal.com': <Heart className="text-green-500" size={24} />,
  'strava.com': <Activity className="text-orange-500" size={24} />,
  'peloton.com': <Bike className="text-black" size={24} />,
  
  // Education & Learning
  'coursera.org': <BookOpen className="text-blue-500" size={24} />,
  'udemy.com': <BookOpen className="text-purple-500" size={24} />,
  'khanacademy.org': <BookOpen className="text-blue-500" size={24} />,
  'edx.org': <BookOpen className="text-blue-500" size={24} />,
  'skillshare.com': <BookOpen className="text-orange-500" size={24} />,
  'pluralsight.com': <BookOpen className="text-orange-500" size={24} />,
  
  // Professional Services
  'salesforce.com': <Database className="text-blue-500" size={24} />,
  'hubspot.com': <Database className="text-orange-500" size={24} />,
  'zendesk.com': <MessageSquare className="text-green-500" size={24} />,
  'intercom.com': <MessageSquare className="text-blue-500" size={24} />,
  'mailchimp.com': <Mail className="text-yellow-500" size={24} />,
  'sendgrid.com': <Mail className="text-blue-500" size={24} />,
  
  // Analytics & Monitoring
  'google-analytics.com': <BarChart3 className="text-blue-500" size={24} />,
  'mixpanel.com': <BarChart3 className="text-purple-500" size={24} />,
  'amplitude.com': <BarChart3 className="text-blue-500" size={24} />,
  'hotjar.com': <Activity className="text-orange-500" size={24} />,
  'fullstory.com': <Activity className="text-blue-500" size={24} />,
  'datadog.com': <Activity className="text-orange-500" size={24} />,
  'newrelic.com': <Activity className="text-blue-500" size={24} />,
  
  // Design & Creative
  'behance.net': <Image className="text-blue-500" size={24} />,
  'dribbble.com': <Image className="text-pink-500" size={24} />,
  'deviantart.com': <Image className="text-green-500" size={24} />,
  'artstation.com': <Image className="text-blue-500" size={24} />,
  'canva.com': <Image className="text-blue-500" size={24} />,
  'adobe.com': <Image className="text-red-500" size={24} />,
  'sketch.com': <Image className="text-yellow-500" size={24} />,
  
  // News & Information
  'cnn.com': <Globe className="text-red-500" size={24} />,
  'bbc.com': <Globe className="text-red-500" size={24} />,
  'reuters.com': <Globe className="text-black" size={24} />,
  'nytimes.com': <Globe className="text-black" size={24} />,
  'washingtonpost.com': <Globe className="text-blue-500" size={24} />,
  'wsj.com': <Globe className="text-blue-500" size={24} />,
  'bloomberg.com': <Globe className="text-orange-500" size={24} />,
  'forbes.com': <Globe className="text-green-500" size={24} />,
  
  // Weather & Environment
  'weather.com': <Cloud className="text-blue-500" size={24} />,
  'accuweather.com': <Cloud className="text-blue-500" size={24} />,
  'wunderground.com': <Cloud className="text-blue-500" size={24} />,
  
  // Government & Official
  'irs.gov': <Building2 className="text-blue-600" size={24} />,
  'usps.com': <Mail className="text-blue-500" size={24} />,
  'dmv.org': <Building2 className="text-blue-600" size={24} />,
  
  // Utilities & Tools
  'speedtest.net': <Zap className="text-orange-500" size={24} />,
  'whois.com': <Globe className="text-blue-500" size={24} />,
  'archive.org': <Archive className="text-orange-500" size={24} />,
  'waybackmachine.org': <Archive className="text-orange-500" size={24} />,
};

/**
 * Enhanced function to get the appropriate icon for a URL
 * @param url - The URL to get an icon for
 * @param size - Optional icon size (default: 24)
 * @returns React.ReactNode - The appropriate icon component
 */
export const getIconForUrl = (url: string, size: number = 24): React.ReactNode => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Check for exact domain matches first
    for (const [domain, icon] of Object.entries(domainIcons)) {
      if (hostname === domain || hostname.endsWith('.' + domain)) {
        return icon;
      }
    }
    
    // Check for partial matches (for subdomains)
    for (const [domain, icon] of Object.entries(domainIcons)) {
      if (hostname.includes(domain)) {
        return icon;
      }
    }
    
    // Special handling for common patterns
    if (hostname.includes('google.com/maps')) {
      return <MapPin className="text-blue-500" size={size} />;
    }
    
    if (hostname.includes('linkedin.com/learning')) {
      return <BookOpen className="text-blue-600" size={size} />;
    }
    
    // Check for common TLDs and provide appropriate icons
    if (hostname.endsWith('.edu')) {
      return <BookOpen className="text-blue-600" size={size} />;
    }
    
    if (hostname.endsWith('.gov')) {
      return <Building2 className="text-blue-600" size={size} />;
    }
    
    if (hostname.endsWith('.org')) {
      return <Globe className="text-green-600" size={size} />;
    }
    
    // Default icon if no match found
    return <Link size={size} className="text-slate-400" />;
  } catch {
    // If URL is invalid, return default icon
    return <Link size={size} className="text-slate-400" />;
  }
};

/**
 * Get a simple icon name for a URL (useful for database storage)
 * @param url - The URL to get an icon name for
 * @returns string - The icon name
 */
export const getIconNameForUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Check for exact domain matches first
    for (const domain of Object.keys(domainIcons)) {
      if (hostname === domain || hostname.endsWith('.' + domain)) {
        return domain;
      }
    }
    
    // Check for partial matches (for subdomains)
    for (const domain of Object.keys(domainIcons)) {
      if (hostname.includes(domain)) {
        return domain;
      }
    }
    
    // Special handling for common patterns
    if (hostname.includes('google.com/maps')) {
      return 'maps';
    }
    
    if (hostname.includes('linkedin.com/learning')) {
      return 'learning';
    }
    
    // Check for common TLDs
    if (hostname.endsWith('.edu')) {
      return 'education';
    }
    
    if (hostname.endsWith('.gov')) {
      return 'government';
    }
    
    if (hostname.endsWith('.org')) {
      return 'organization';
    }
    
    // Default
    return 'link';
  } catch {
    return 'link';
  }
};

// Service name to URL mapping for auto-suggestions
export const serviceNameToUrl: { [key: string]: string } = {
  // Google Services
  'google docs': 'https://docs.google.com',
  'google doc': 'https://docs.google.com',
  'docs': 'https://docs.google.com',
  'google calendar': 'https://calendar.google.com',
  'calendar': 'https://calendar.google.com',
  'gmail': 'https://mail.google.com',
  'google mail': 'https://mail.google.com',
  'google meet': 'https://meet.google.com',
  'meet': 'https://meet.google.com',
  'google drive': 'https://drive.google.com',
  'drive': 'https://drive.google.com',
  'google sheets': 'https://sheets.google.com',
  'sheets': 'https://sheets.google.com',
  'google slides': 'https://slides.google.com',
  'slides': 'https://slides.google.com',
  'google forms': 'https://forms.google.com',
  'forms': 'https://forms.google.com',
  'google sites': 'https://sites.google.com',
  'sites': 'https://sites.google.com',
  'google keep': 'https://keep.google.com',
  'keep': 'https://keep.google.com',
  'google photos': 'https://photos.google.com',
  'photos': 'https://photos.google.com',
  'google maps': 'https://maps.google.com',
  'maps': 'https://maps.google.com',
  'google translate': 'https://translate.google.com',
  'translate': 'https://translate.google.com',
  'google analytics': 'https://analytics.google.com',
  'analytics': 'https://analytics.google.com',
  'google search': 'https://search.google.com',
  'search': 'https://search.google.com',
  'google cloud': 'https://cloud.google.com',
  'cloud': 'https://cloud.google.com',
  
  // Microsoft Services
  'teams': 'https://teams.microsoft.com',
  'microsoft teams': 'https://teams.microsoft.com',
  'outlook': 'https://outlook.office.com',
  'office': 'https://office.com',
  'microsoft office': 'https://office.com',
  'onedrive': 'https://onedrive.live.com',
  'sharepoint': 'https://sharepoint.com',
  'azure': 'https://azure.microsoft.com',
  'azure portal': 'https://portal.azure.com',
  'azure devops': 'https://dev.azure.com',
  'visual studio': 'https://visualstudio.com',
  'power bi': 'https://powerbi.com',
  'powerbi': 'https://powerbi.com',
  'dynamics': 'https://dynamics.com',
  
  // Communication & Collaboration
  'slack': 'https://slack.com',
  'discord': 'https://discord.com',
  'zoom': 'https://zoom.us',
  'webex': 'https://webex.com',
  'skype': 'https://skype.com',
  'whatsapp': 'https://whatsapp.com',
  'telegram': 'https://telegram.org',
  'signal': 'https://signal.org',
  
  // Productivity & Documentation
  'notion': 'https://notion.so',
  'figma': 'https://figma.com',
  'miro': 'https://miro.com',
  'whimsical': 'https://whimsical.com',
  'trello': 'https://trello.com',
  'asana': 'https://asana.com',
  'monday': 'https://monday.com',
  'monday.com': 'https://monday.com',
  'clickup': 'https://clickup.com',
  'airtable': 'https://airtable.com',
  'confluence': 'https://confluence.atlassian.com',
  'jira': 'https://jira.atlassian.com',
  'linear': 'https://linear.app',
  'basecamp': 'https://basecamp.com',
  
  // Development & Code
  'github': 'https://github.com',
  'gitlab': 'https://gitlab.com',
  'bitbucket': 'https://bitbucket.org',
  'stack overflow': 'https://stackoverflow.com',
  'stackoverflow': 'https://stackoverflow.com',
  'codepen': 'https://codepen.io',
  'jsfiddle': 'https://jsfiddle.net',
  'replit': 'https://replit.com',
  'codesandbox': 'https://codesandbox.io',
  'vercel': 'https://vercel.com',
  'netlify': 'https://netlify.com',
  'heroku': 'https://heroku.com',
  'aws': 'https://aws.amazon.com',
  'amazon web services': 'https://aws.amazon.com',
  'digitalocean': 'https://digitalocean.com',
  'cloudflare': 'https://cloudflare.com',
  
  // Storage & File Sharing
  'dropbox': 'https://dropbox.com',
  'box': 'https://box.com',
  'mega': 'https://mega.nz',
  'pcloud': 'https://pcloud.com',
  'icloud': 'https://icloud.com',
  
  // Social Media
  'linkedin': 'https://linkedin.com',
  'twitter': 'https://twitter.com',
  'x': 'https://twitter.com',
  'facebook': 'https://facebook.com',
  'instagram': 'https://instagram.com',
  'youtube': 'https://youtube.com',
  'vimeo': 'https://vimeo.com',
  'tiktok': 'https://tiktok.com',
  'reddit': 'https://reddit.com',
  'pinterest': 'https://pinterest.com',
  'snapchat': 'https://snapchat.com',
  
  // Entertainment & Media
  'spotify': 'https://spotify.com',
  'apple': 'https://apple.com',
  'netflix': 'https://netflix.com',
  'disney plus': 'https://disneyplus.com',
  'disneyplus': 'https://disneyplus.com',
  'hulu': 'https://hulu.com',
  'amazon': 'https://amazon.com',
  'steam': 'https://steam.com',
  'twitch': 'https://twitch.tv',
  
  // E-commerce & Shopping
  'shopify': 'https://shopify.com',
  'woocommerce': 'https://woocommerce.com',
  'etsy': 'https://etsy.com',
  'ebay': 'https://ebay.com',
  'walmart': 'https://walmart.com',
  'target': 'https://target.com',
  'best buy': 'https://bestbuy.com',
  'bestbuy': 'https://bestbuy.com',
  
  // Finance & Banking
  'paypal': 'https://paypal.com',
  'stripe': 'https://stripe.com',
  'square': 'https://square.com',
  'coinbase': 'https://coinbase.com',
  'binance': 'https://binance.com',
  'robinhood': 'https://robinhood.com',
  'fidelity': 'https://fidelity.com',
  'vanguard': 'https://vanguard.com',
  
  // Travel & Transportation
  'booking': 'https://booking.com',
  'airbnb': 'https://airbnb.com',
  'expedia': 'https://expedia.com',
  'kayak': 'https://kayak.com',
  'uber': 'https://uber.com',
  'lyft': 'https://lyft.com',
  'waze': 'https://waze.com',
  
  // Food & Dining
  'doordash': 'https://doordash.com',
  'uber eats': 'https://ubereats.com',
  'ubereats': 'https://ubereats.com',
  'grubhub': 'https://grubhub.com',
  'postmates': 'https://postmates.com',
  'yelp': 'https://yelp.com',
  'opentable': 'https://opentable.com',
  
  // Health & Fitness
  'fitbit': 'https://fitbit.com',
  'myfitnesspal': 'https://myfitnesspal.com',
  'strava': 'https://strava.com',
  'peloton': 'https://peloton.com',
  
  // Education & Learning
  'coursera': 'https://coursera.org',
  'udemy': 'https://udemy.com',
  'khan academy': 'https://khanacademy.org',
  'khanacademy': 'https://khanacademy.org',
  'edx': 'https://edx.org',
  'skillshare': 'https://skillshare.com',
  'pluralsight': 'https://pluralsight.com',
  
  // Professional Services
  'salesforce': 'https://salesforce.com',
  'hubspot': 'https://hubspot.com',
  'zendesk': 'https://zendesk.com',
  'intercom': 'https://intercom.com',
  'mailchimp': 'https://mailchimp.com',
  'sendgrid': 'https://sendgrid.com',
  
  // Analytics & Monitoring
  'mixpanel': 'https://mixpanel.com',
  'amplitude': 'https://amplitude.com',
  'hotjar': 'https://hotjar.com',
  'fullstory': 'https://fullstory.com',
  'datadog': 'https://datadog.com',
  'newrelic': 'https://newrelic.com',
  
  // Design & Creative
  'behance': 'https://behance.net',
  'dribbble': 'https://dribbble.com',
  'deviantart': 'https://deviantart.com',
  'artstation': 'https://artstation.com',
  'canva': 'https://canva.com',
  'adobe': 'https://adobe.com',
  'sketch': 'https://sketch.com',
  
  // News & Information
  'cnn': 'https://cnn.com',
  'bbc': 'https://bbc.com',
  'reuters': 'https://reuters.com',
  'new york times': 'https://nytimes.com',
  'nytimes': 'https://nytimes.com',
  'washington post': 'https://washingtonpost.com',
  'wall street journal': 'https://wsj.com',
  'wsj': 'https://wsj.com',
  'bloomberg': 'https://bloomberg.com',
  'forbes': 'https://forbes.com',
  
  // Weather & Environment
  'weather': 'https://weather.com',
  'accuweather': 'https://accuweather.com',
  'weather underground': 'https://wunderground.com',
  'wunderground': 'https://wunderground.com',
  
  // Government & Official
  'irs': 'https://irs.gov',
  'usps': 'https://usps.com',
  'dmv': 'https://dmv.org',
  
  // Utilities & Tools
  'speedtest': 'https://speedtest.net',
  'whois': 'https://whois.com',
  'archive': 'https://archive.org',
  'wayback machine': 'https://waybackmachine.org',
  'waybackmachine': 'https://waybackmachine.org',
};

/**
 * Get URL suggestions based on service name input
 * @param input - The text input to search for
 * @returns Array of matching service names and their URLs
 */
export const getUrlSuggestions = (input: string): Array<{ name: string; url: string }> => {
  if (!input.trim()) return [];
  
  const searchTerm = input.toLowerCase().trim();
  const suggestions: Array<{ name: string; url: string }> = [];
  
  for (const [name, url] of Object.entries(serviceNameToUrl)) {
    if (name.includes(searchTerm) || searchTerm.includes(name)) {
      suggestions.push({ name, url });
    }
  }
  
  // Sort by relevance (exact matches first, then alphabetical)
  return suggestions.sort((a, b) => {
    const aExact = a.name === searchTerm;
    const bExact = b.name === searchTerm;
    
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    
    return a.name.localeCompare(b.name);
  }).slice(0, 5); // Limit to 5 suggestions
};

/**
 * Get the best URL match for a service name
 * @param input - The text input to search for
 * @returns The URL if found, null otherwise
 */
export const getBestUrlMatch = (input: string): string | null => {
  const suggestions = getUrlSuggestions(input);
  return suggestions.length > 0 ? suggestions[0].url : null;
}; 