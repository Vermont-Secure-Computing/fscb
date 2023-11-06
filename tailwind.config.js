/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/js/*.js',
    './src/*.html'
  ],
  theme: {
    maxHeight: {
     '0': '0',
     '25': '25%',
     '50': '50%',
     '75': '75%',
     '80': '80%',
     'full': '100%',
     '520': '520px',
    }
  }
  // ...
}
