requirejs.config({
            config: {
              es6: {
                resolveModuleSource: function(source) {
                  return 'es6!'+source;
                }
              }
            },
            paths: {
                es6: '../es6',
                babel: '../babel-5.8.34.min'
            }
        });
