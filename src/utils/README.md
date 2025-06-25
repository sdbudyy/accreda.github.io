# Link Icon Utility

This utility provides intelligent icon detection for URLs, automatically displaying the appropriate icon based on the domain or service.

## Features

- **Comprehensive Domain Coverage**: Supports 100+ popular services and domains
- **Smart Icon Detection**: Automatically detects the appropriate icon based on URL patterns
- **Auto-Suggestion System**: Type service names to get URL suggestions and auto-fill
- **Fallback Support**: Provides sensible defaults for unknown domains
- **TLD Recognition**: Special handling for .edu, .gov, .org domains
- **Customizable Size**: Icons can be resized as needed
- **TypeScript Support**: Fully typed for better development experience

## Usage

### Basic Usage

```tsx
import { getIconForUrl } from '../utils/linkIcons';

// In your component
const MyComponent = () => {
  const url = "https://docs.google.com/document/d/123";
  
  return (
    <div>
      {getIconForUrl(url)}
      <span>My Google Doc</span>
    </div>
  );
};
```

### Auto-Suggestion System

The utility now includes an intelligent auto-suggestion system that allows users to type service names and get URL suggestions:

```tsx
import { getUrlSuggestions, getBestUrlMatch } from '../utils/linkIcons';

// Get multiple suggestions
const suggestions = getUrlSuggestions('github');
// Returns: [{ name: 'github', url: 'https://github.com' }]

// Get the best match
const bestUrl = getBestUrlMatch('notion');
// Returns: 'https://notion.so'
```

### Custom Icon Size

```tsx
// Default size (24px)
{getIconForUrl(url)}

// Custom size
{getIconForUrl(url, 32)}
```

### Icon Name for Database Storage

```tsx
import { getIconNameForUrl } from '../utils/linkIcons';

const iconName = getIconNameForUrl(url);
// Returns: "docs.google.com" for Google Docs
// Returns: "link" for unknown domains
```

## Auto-Suggestion Examples

### How It Works
1. **Type a service name** in the name field (e.g., "github", "notion", "google docs")
2. **See suggestions appear** with icons and URLs
3. **Click a suggestion** to auto-fill both name and URL
4. **Perfect matches** automatically fill the URL field

### Example Inputs and Results

| What You Type | Suggestions You Get |
|---------------|-------------------|
| `github` | GitHub (https://github.com) |
| `google` | Google Docs, Google Calendar, Gmail, Google Drive, etc. |
| `notion` | Notion (https://notion.so) |
| `slack` | Slack (https://slack.com) |
| `zoom` | Zoom (https://zoom.us) |
| `figma` | Figma (https://figma.com) |
| `aws` | AWS (https://aws.amazon.com) |
| `spotify` | Spotify (https://spotify.com) |

### Smart Matching
- **Partial matches**: Type "docs" → Google Docs
- **Abbreviations**: Type "aws" → Amazon Web Services
- **Common names**: Type "x" → Twitter
- **Full names**: Type "microsoft teams" → Teams

## Supported Services

### Google Services
- docs.google.com (Google Docs)
- calendar.google.com (Google Calendar)
- mail.google.com (Gmail)
- meet.google.com (Google Meet)
- drive.google.com (Google Drive)
- sheets.google.com (Google Sheets)
- slides.google.com (Google Slides)
- forms.google.com (Google Forms)
- sites.google.com (Google Sites)
- keep.google.com (Google Keep)
- photos.google.com (Google Photos)
- maps.google.com (Google Maps)
- translate.google.com (Google Translate)
- analytics.google.com (Google Analytics)
- search.google.com (Google Search)
- console.google.com (Google Cloud Console)
- cloud.google.com (Google Cloud)

### Microsoft Services
- teams.microsoft.com (Microsoft Teams)
- outlook.office.com (Outlook)
- office.com (Microsoft Office)
- onedrive.live.com (OneDrive)
- sharepoint.com (SharePoint)
- azure.microsoft.com (Azure)
- portal.azure.com (Azure Portal)
- dev.azure.com (Azure DevOps)
- visualstudio.com (Visual Studio)
- powerbi.com (Power BI)
- dynamics.com (Dynamics)

### Communication & Collaboration
- slack.com (Slack)
- discord.com (Discord)
- zoom.us (Zoom)
- webex.com (Webex)
- skype.com (Skype)
- whatsapp.com (WhatsApp)
- telegram.org (Telegram)
- signal.org (Signal)

### Productivity & Documentation
- notion.so (Notion)
- figma.com (Figma)
- miro.com (Miro)
- whimsical.com (Whimsical)
- trello.com (Trello)
- asana.com (Asana)
- monday.com (Monday.com)
- clickup.com (ClickUp)
- airtable.com (Airtable)
- confluence.atlassian.com (Confluence)
- jira.atlassian.com (Jira)
- linear.app (Linear)
- basecamp.com (Basecamp)

### Development & Code
- github.com (GitHub)
- gitlab.com (GitLab)
- bitbucket.org (Bitbucket)
- stackoverflow.com (Stack Overflow)
- codepen.io (CodePen)
- jsfiddle.net (JSFiddle)
- replit.com (Replit)
- codesandbox.io (CodeSandbox)
- vercel.com (Vercel)
- netlify.com (Netlify)
- heroku.com (Heroku)
- aws.amazon.com (AWS)
- digitalocean.com (DigitalOcean)
- cloudflare.com (Cloudflare)

### Storage & File Sharing
- dropbox.com (Dropbox)
- box.com (Box)
- mega.nz (MEGA)
- pcloud.com (pCloud)
- icloud.com (iCloud)

### Social Media
- linkedin.com (LinkedIn)
- twitter.com (Twitter)
- facebook.com (Facebook)
- instagram.com (Instagram)
- youtube.com (YouTube)
- vimeo.com (Vimeo)
- tiktok.com (TikTok)
- reddit.com (Reddit)
- pinterest.com (Pinterest)
- snapchat.com (Snapchat)

### Entertainment & Media
- spotify.com (Spotify)
- apple.com (Apple)
- netflix.com (Netflix)
- disneyplus.com (Disney+)
- hulu.com (Hulu)
- amazon.com (Amazon)
- steam.com (Steam)
- twitch.tv (Twitch)

### E-commerce & Shopping
- shopify.com (Shopify)
- woocommerce.com (WooCommerce)
- etsy.com (Etsy)
- ebay.com (eBay)
- walmart.com (Walmart)
- target.com (Target)
- bestbuy.com (Best Buy)

### Finance & Banking
- paypal.com (PayPal)
- stripe.com (Stripe)
- square.com (Square)
- coinbase.com (Coinbase)
- binance.com (Binance)
- robinhood.com (Robinhood)
- fidelity.com (Fidelity)
- vanguard.com (Vanguard)

### Travel & Transportation
- booking.com (Booking.com)
- airbnb.com (Airbnb)
- expedia.com (Expedia)
- kayak.com (Kayak)
- uber.com (Uber)
- lyft.com (Lyft)
- waze.com (Waze)

### Food & Dining
- doordash.com (DoorDash)
- ubereats.com (Uber Eats)
- grubhub.com (Grubhub)
- postmates.com (Postmates)
- yelp.com (Yelp)
- opentable.com (OpenTable)

### Health & Fitness
- fitbit.com (Fitbit)
- myfitnesspal.com (MyFitnessPal)
- strava.com (Strava)
- peloton.com (Peloton)

### Education & Learning
- coursera.org (Coursera)
- udemy.com (Udemy)
- khanacademy.org (Khan Academy)
- edx.org (edX)
- skillshare.com (Skillshare)
- pluralsight.com (Pluralsight)

### Professional Services
- salesforce.com (Salesforce)
- hubspot.com (HubSpot)
- zendesk.com (Zendesk)
- intercom.com (Intercom)
- mailchimp.com (Mailchimp)
- sendgrid.com (SendGrid)

### Analytics & Monitoring
- google-analytics.com (Google Analytics)
- mixpanel.com (Mixpanel)
- amplitude.com (Amplitude)
- hotjar.com (Hotjar)
- fullstory.com (FullStory)
- datadog.com (Datadog)
- newrelic.com (New Relic)

### Design & Creative
- behance.net (Behance)
- dribbble.com (Dribbble)
- deviantart.com (DeviantArt)
- artstation.com (ArtStation)
- canva.com (Canva)
- adobe.com (Adobe)
- sketch.com (Sketch)

### News & Information
- cnn.com (CNN)
- bbc.com (BBC)
- reuters.com (Reuters)
- nytimes.com (The New York Times)
- washingtonpost.com (The Washington Post)
- wsj.com (The Wall Street Journal)
- bloomberg.com (Bloomberg)
- forbes.com (Forbes)

### Weather & Environment
- weather.com (The Weather Channel)
- accuweather.com (AccuWeather)
- wunderground.com (Weather Underground)

### Government & Official
- irs.gov (IRS)
- usps.com (USPS)
- dmv.org (DMV)

### Utilities & Tools
- speedtest.net (Speedtest)
- whois.com (WHOIS)
- archive.org (Internet Archive)
- waybackmachine.org (Wayback Machine)

## Special Features

### TLD Recognition
The utility automatically recognizes common top-level domains and provides appropriate icons:
- `.edu` → Education icon
- `.gov` → Government icon  
- `.org` → Organization icon

### Subdomain Support
The utility works with subdomains:
- `docs.google.com` → Google Docs icon
- `calendar.google.com` → Google Calendar icon
- `mail.google.com` → Gmail icon

### Fallback Behavior
For unknown domains, the utility returns a generic link icon with a neutral gray color.

## Integration Examples

### Quick Links Component
```tsx
// Used in QuickLinks component for dashboard
{getIconForUrl(link.url)}
```

### Auto-Suggestion in Modal
```tsx
// Used in add link modal for auto-suggestions
const handleNameChange = (e) => {
  const newName = e.target.value;
  const suggestions = getUrlSuggestions(newName);
  setSuggestions(suggestions);
  
  // Auto-fill URL for perfect matches
  if (suggestions.length > 0 && suggestions[0].name === newName) {
    setUrl(suggestions[0].url);
  }
};

// Display suggestions dropdown
{suggestions.map(suggestion => (
  <button onClick={() => handleSuggestionClick(suggestion)}>
    {getIconForUrl(suggestion.url)}
    <span>{suggestion.name}</span>
  </button>
))}
```

### Preview in Modal
```tsx
// Used in add link modal for preview
{url && (
  <div className="preview">
    {getIconForUrl(url)}
    <span>{name || 'Link Name'}</span>
  </div>
)}
```

### Database Storage
```tsx
// Store icon name in database
const iconName = getIconNameForUrl(url);
await supabase.from('quick_links').insert({
  url,
  name,
  icon: iconName
});
```

## Adding New Domains

To add support for new domains, edit the `domainIcons` object in `src/utils/linkIcons.tsx`:

```tsx
export const domainIcons: { [key: string]: React.ReactNode } = {
  // ... existing domains
  
  // Add new domain
  'example.com': <YourIcon className="text-your-color" size={24} />,
};
```

## Best Practices

1. **Use consistent icon sizes** - Default to 24px for consistency
2. **Choose appropriate colors** - Use brand colors when possible
3. **Test with various URLs** - Ensure subdomains and variations work
4. **Handle errors gracefully** - The utility returns a fallback icon for invalid URLs
5. **Consider accessibility** - Icons should have appropriate alt text or labels

## Performance

The utility is optimized for performance:
- Domain matching is done efficiently with early returns
- Icons are pre-rendered React components
- No external API calls required
- Minimal bundle size impact 