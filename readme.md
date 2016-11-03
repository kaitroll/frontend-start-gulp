# Frontend Start Gulp
### Features
1. PostCss with plugins
2. SASS
3. JavaScript ES6 Modules
4. Minify html, css, js, images
5. Live reload server http://localhost:8080/
6. Copy npm dependencies only in built folder
7. Eslint (good for Atom editor)

### Install
1. `npm i -g gulp`
2. `npm i`

### Use
1. `npm start` for development
2. `npm run build` for production
3. Clean build folder: `npm run clean-dev` and `npm run clean-prod`
4. Default use PostCss. If want use SASS you must uncomment in gulpfile.js 142 and 160 lines. Plus comment 161 and 143 lines.
