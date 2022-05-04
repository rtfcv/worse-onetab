rem for Windows
set NODE_ENV=production
tailwindcss -i .\src\style.css  -o .\dist\style.css
webpack --mode=production
