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
  "restoreTabsDiscarded": true,
  "storePinned": false
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
    "@codemirror/lang-json": "^6.0.0",
    "@replit/codemirror-vim": "^6.3.0",
    "@uiw/react-codemirror": "^4.25.3",
    "daisyui": "^5.5.8",
    "react": "^19.2.1",
    "react-dom": "^19.2.1"
  },
  "devDependencies": {
    "@babel/core": "^7.28.5",
    "@babel/preset-env": "^7.28.5",
    "@babel/preset-react": "^7.28.5",
    "@tailwindcss/typography": "^0.5.19",
    "@tailwindcss/cli": "^4.1.17",
    "@types/chrome": "^0.1.32",
    "@types/react": "^19.2.7",
    "@types/webpack": "^5.28.5",
    "babel-loader": "^10.0.0",
    "copy-webpack-plugin": "^13.0.1",
    "css-loader": "^7.1.2",
    "html-webpack-plugin": "^5.6.5",
    "tailwindcss": "^4.1.17",
    "terser-webpack-plugin": "^5.3.15",
    "webpack": "^5.103.0",
    "webpack-cli": "^6.0.1"
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
