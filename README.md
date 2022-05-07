# worse-onetab

opensource and simplist alternative to [OneTab](https://www.one-tab.com/).  

Inspired by [better-onetab](https://github.com/cnwangjie/better-onetab), which seems to be no-longer maintained, but is worse in every way except for performance.  

## Options

Currently only available in form of json.

### Default Value

```json
{
  "theme": "dark",
  "editMode": "default",
  "actionButton": "popUp",
  "restoreTabsDiscarded": true
}
```

### Keys

- theme  
  - Extension theme
  -  accepts: "dark", "light", "business", "luxury", "black", ... and more
- editMode  
  - Keybind for internal editor.
  - accepts: "default", "vim"
- actionButton
  - What to do when actionButton is pressed.
  - accepts: "popUp", "tabList", "storeTabsOnCurrentWindow"
- restoreTabsDiscarded
  - Whether to restore tabs discarded.
  - accepts: true, false

## Dependencies

```json
{
  "dependencies": {
    "@codemirror/lang-json": "^0.20.0",
    "@replit/codemirror-vim": "^0.20.0",
    "@uiw/react-codemirror": "^4.7.0",
    "daisyui": "^2.14.3",
    "react": "^18.1.0",
    "react-daisyui": "^2.0.1",
    "react-dom": "^18.1.0"
  },
  "devDependencies": {
    "@babel/core": "^7.17.10",
    "@babel/preset-env": "^7.17.10",
    "@babel/preset-react": "^7.16.7",
    "@tailwindcss/typography": "^0.5.2",
    "@types/chrome": "^0.0.184",
    "@types/react": "^18.0.8",
    "@types/tailwindcss": "^3.0.10",
    "@types/webpack": "^5.28.0",
    "babel-loader": "^8.2.5",
    "copy-webpack-plugin": "^10.2.4",
    "css-loader": "^6.7.1",
    "html-webpack-plugin": "^5.5.0",
    "tailwindcss": "^3.0.24",
    "terser-webpack-plugin": "^5.3.1",
    "webpack": "^5.72.0",
    "webpack-cli": "^4.9.2"
  }
}
```

## Build Instruction

```bash
npm install
npm run build
```

## Licence
MIT License
