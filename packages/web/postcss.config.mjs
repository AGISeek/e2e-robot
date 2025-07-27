/** @type {import('postcss').ProcessOptions} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      // 确保添加标准属性
      add: true,
      remove: false,
      flexbox: 'no-2009'
    },
    // 添加postcss-preset-env来处理现代CSS特性
    'postcss-preset-env': {
      stage: 3,
      features: {
        'custom-properties': false
      }
    }
  },
}

export default config