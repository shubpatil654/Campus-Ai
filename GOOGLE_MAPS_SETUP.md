# Google Maps Setup Guide

## 🗺️ Setting up Google Maps for CampusAI

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API**
4. Go to **Credentials** and create an **API Key**
5. Copy your API key

### 2. Configure Environment Variables

Create a `.env` file in the `client` directory with the following content:

```env
# Google Maps API Key
REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY_HERE

# Other environment variables
REACT_APP_API_URL=http://localhost:5000
```

### 3. API Key Security (Recommended)

For production, restrict your API key:
1. Go to Google Cloud Console > Credentials
2. Click on your API key
3. Under "Application restrictions", select "HTTP referrers"
4. Add your domain(s)
5. Under "API restrictions", select "Restrict key" and choose "Maps JavaScript API"

### 4. Features Included

✅ **Interactive Map**: Real Google Maps with dark theme
✅ **College Markers**: Custom styled markers for each college
✅ **Info Windows**: Click markers to see college details
✅ **Responsive Design**: Works on all screen sizes
✅ **Dark Theme**: Matches CampusAI's design
✅ **Custom Styling**: Yellow/orange gradient markers

### 5. College Locations

The map currently shows these sample colleges in Belagavi:
- RLS Institute of Technology (15.8497°N, 74.4977°E)
- GSS Institute of Technology (15.8497°N, 74.4977°E)
- Jain Institute of Technology (15.8497°N, 74.4977°E)

### 6. Troubleshooting

If the map doesn't load:
1. Check your API key is correct
2. Ensure Maps JavaScript API is enabled
3. Check browser console for errors
4. Verify the `.env` file is in the correct location
5. Restart your development server after adding the API key

### 7. Customization

You can customize the map by editing `client/src/components/GoogleMap.js`:
- Change map center coordinates
- Modify zoom level
- Update marker styles
- Add more college locations
- Customize map styling

---

**Note**: The map will show a loading spinner until you add a valid Google Maps API key.
