require('@babel/register')({
  ignore: [/node_modules\/(?!@rplan)/],
  extensions: ['.js', '.ts', '.jsx', '.tsx'],
})
