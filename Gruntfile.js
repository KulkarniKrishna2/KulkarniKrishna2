'use strict';

module.exports = function(grunt) {
  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);
  grunt.loadNpmTasks('grunt-gitinfo');
  // Project configuration.
  grunt.initConfig({
    'grunt-license-report': {
      output: {
        path: './report/licenses',
        format:'html'
      }
    },
    gitinfo: {
      commands: {
        'status': ['status', '--porcelain'],
        'origin-SHA': ['rev-parse', '--verify', 'origin'],
        'fullBranch': ['name-rev', '--name-only' ,'HEAD']
      }
    },
    pkg: grunt.file.readJSON('package.json'),
    // Project settings
    mifosx: {
      // configurable paths
      app: require('./bower.json').appPath || 'app',
      dist: 'dist',
      target: 'conflux-web',
      test: 'test'
    },
    watch: {
        js: {
            files: ['<%= mifosx.app %>/scripts/**/*.js'],
            options: {
                livereload: true
            }
        },
        gruntfile: {
            files: ['Gruntfile.js']
        },
        livereload: {
            options: {
                livereload: '<%= connect.options.livereload %>'
            },
            files: [
                '<%= mifosx.app %>/**/*.html',
                '<%= mifosx.app %>/{,*/}*.json',
                '<%= mifosx.app %>/**/*.js',
                '<%= mifosx.app %>/**/*.css',
                '<%= mifosx.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                // ignore directories to reduce CPU usage by watch/node process
                '!<%= mifosx.app %>/bower_components/**'
            ]
        }
    },
     // The actual grunt server settings
    connect: {
        options: {
            port:  9000,
            hostname: 'localhost',
            livereload: 35729,
            open:'http://<%= connect.options.hostname %>:<%= connect.options.port %>?baseApiUrl=http://localhost:8080'
        },
        livereload: {
            options: {
                base: [
                    '.tmp',
                    '<%= mifosx.app %>'
                ]
            }
        }
    },
    // w3c html calidation
    validation: {
        options: {
            reset: true,
            relaxerror: ['no document type declaration; will parse without validation', 'document type does not allow element \\"[A-Z]+\\" here']
        },
        files: {
            src: [
                '<%= mifosx.app  %>/views/{,*/}*.html', // Validating templates may not be of much use.
                '<%= mifosx.app  %>/index.html'
                ]
        }
    },
    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish'),
        reporterOutput:'jshint-log.xml',
        force: true
      },
      all: ['Gruntfile.js', '<%= mifosx.app %>/scripts/**/*.js']
    },

    karma: {
      unit: {
          configFile: 'karma.conf.js'
      }
    },

    //uglify the js files
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      prod: {
        files: [{'<%= mifosx.dist %>/<%=mifosx.target%>/bower_components/angular-mocks/angular-mocks.min.js'
          :['<%= mifosx.app %>/bower_components/angular-mocks/angular-mocks.js'],
          '<%= mifosx.dist %>/<%=mifosx.target%>/bower_components/angular-webstorage/angular-webstorage.min.js'
          :['<%= mifosx.app %>/bower_components/angular-webstorage/angular-webstorage.js'],
          '<%= mifosx.dist %>/<%=mifosx.target%>/bower_components/q/q.min.js'
          :['<%= mifosx.app %>/bower_components/q/q.js'],
          //'<%= mifosx.dist %>/<%=mifosx.target%>/bower_components/datatables/media/js/jquery.dataTables.min.js'
          //:['<%= mifosx.app %>/bower_components/datatables/media/js/jquery.dataTables.js'],
          //'<%= mifosx.dist %>/<%=mifosx.target%>/bower_components/require-css/css.min.js'
          //:['<%= mifosx.app %>/bower_components/require-css/css.js'],
          //'<%= mifosx.dist %>/<%=mifosx.target%>/bower_components/requirejs/requirejs.min.js'
          //:['<%= mifosx.app %>/bower_components/requirejs/require.js'],
          '<%= mifosx.dist %>/<%=mifosx.target%>/bower_components/underscore/underscore.min.js'
          :['<%= mifosx.app %>/bower_components/underscore/underscore.js'],
          '<%= mifosx.dist %>/<%=mifosx.target%>/bower_components/angular-utils-pagination/dirPagination.min.js'
          :['<%= mifosx.app %>/bower_components/angular-utils-pagination/dirPagination.js']
        }]
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= mifosx.dist %>/*',
            '!<%= mifosx.dist %>/.git*'
          ]
        }]
      },
      server: ['.tmp','app/version.json']
    },

    // Copies remaining files to places other tasks can use
    copy: {
      prod: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= mifosx.app %>',
          dest: '<%= mifosx.dist %>/<%=mifosx.target%>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'images/{,*/}*.{webp}',
            'fonts/**',
            'images/*',
            'scripts/*.js',
            'scripts/services/*.js',
            'scripts/modules/*.js',
            'scripts/config/*.json',
            'scripts/globalconstants/*.json',
            '!scripts/routes.js',
            '!scripts/initialTasks.js',
            '!scripts/webstorage-configuration.js',
            '!scripts/mifosXComponents.js',
            '!scripts/mifosXComponents-build.js',
            '!scripts/loader.js',
            '!scripts/loader-build.js',
            'styles/*.css',
            '!scripts/mifosXStyles.js',
            '!scripts/mifosXStyles-build.js',
            'global-translations/**',
            '*.html',
            'release.json',
            'views/**',
            'angular/**',
            'version.json'
          ]
        },
        {
          expand: true,
          dot: true,
          cwd: '<%= mifosx.test %>',
          dest: '<%= mifosx.dist %>/<%=mifosx.target%>/test',
          src: [
            '**/**'
          ]
        },
        {
          '<%= mifosx.dist %>/<%=mifosx.target%>/scripts/mifosXComponents.js':['<%= mifosx.app %>/scripts/mifosXComponents-build.js'],
          '<%= mifosx.dist %>/<%=mifosx.target%>/scripts/loader.js':['<%= mifosx.app %>/scripts/loader-build.js'],
          '<%=mifosx.dist %>/<%=mifosx.target%>/scripts/mifosXStyles.js':['<%=mifosx.app%>/scripts/mifosXStyles-build.js']
          //'<%= mifosx.dist %>/<%=mifosx.target%>':['<%= mifosx.test %>/**']
        },
        {
          expand: true,
          dot: true,
          cwd: '<%= mifosx.app %>/bower_components',
          dest: '<%= mifosx.dist %>/<%=mifosx.target%>/bower_components',
          src: [
            '**/*min.js', 'ckeditor/**', 'require-css/*.js', 'require-less/*.js',
            '!jasmine/**', '!requirejs/**/**', 'requirejs/require.js', '!underscore/**',
            'angular-utils-pagination/dirPagination.tpl.html' , 'angular-translate-finflux/**',
            'angular-loading-bar/**','angular-xml2json/**','devtools-detect/**'
          ]
        }
        ]
      },
      dev: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= mifosx.app %>',
          dest: '<%= mifosx.dist %>/<%=mifosx.target%>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'images/{,*/}*.{webp}',
            'fonts/**',
            'scripts/**/*.js',
            'global-translations/**',
            'styles/**',
            '*.html',
            'views/**',
            'images/**',
            'bower_components/**'
          ]
        },
        {
          expand: true,
          dot: true,
          cwd: '<%= mifosx.test %>',
          dest: '<%= mifosx.dist %>/<%=mifosx.target%>/test',
          src: [
            '**/**'
          ]
        }]
      },
        // this won't be necessary after fixing dependencies
        server: {
            expand: true,
            dot: true,
            cwd: '<%= mifosx.test %>',
            dest: '.tmp/test',
            src: '**/**'
        }
    },

      //hashing css & js
      hashres: {
          options: {
              encoding: 'utf8',
              fileNameFormat: '${name}.${hash}.${ext}',
              renameFiles: true
          },
          css: {
              options: {
              },
              dest: '<%= mifosx.dist %>/<%=mifosx.target%>/scripts/mifosXStyles.js',
              src: ['<%= mifosx.dist %>/<%=mifosx.target%>/styles/*.css','!<%= mifosx.dist %>/<%=mifosx.target%>/styles/font-awesome.min.css',
                  '!<%= mifosx.dist %>/<%=mifosx.target%>/styles/laowebfont.css']
          },
          js: {
              options: {
              },
              dest: ['<%= mifosx.dist %>/<%=mifosx.target%>/scripts/mifosXComponents.js'],
              src:  [
                      '<%= mifosx.dist %>/<%=mifosx.target%>/scripts/directives/directives.js',
                      '<%= mifosx.dist %>/<%=mifosx.target%>/scripts/routes-initialTasks-webstorage-configuration.js',
                      '<%= mifosx.dist %>/<%=mifosx.target%>/scripts/controllers/controllers.js',
                      '<%= mifosx.dist %>/<%=mifosx.target%>/scripts/filters/filters.js',
                      '<%= mifosx.dist %>/<%=mifosx.target%>/scripts/models/models.js'
              ]
          },
          ext : {
              options: {},
              dest: '<%= mifosx.dist %>/<%=mifosx.target%>/scripts/loader.js',
              src:   ['<%= mifosx.dist %>/<%=mifosx.target%>/scripts/mifosXComponents.js','<%= mifosx.dist %>/<%=mifosx.target%>/scripts/mifosXStyles.js']
          },
          loader : {
              options: {},
              src: '<%= mifosx.dist %>/<%=mifosx.target%>/scripts/loader.js',
              dest: '<%= mifosx.dist %>/<%=mifosx.target%>/index.html'
          }
      },

    // rename files
      replace: {
          text: {
              src: ['<%= mifosx.dist %>/<%=mifosx.target%>/scripts/mifosXComponents*','<%= mifosx.dist %>/<%=mifosx.target%>/scripts/loader*'],
              overwrite: true,
              replacements: [{
                  from: '.js',
                  to: ''
              }]
          }
      },
    // concatinate JS files
    /** FIXME: Address issues with this task**/
    concat: {
      options: {
        separator: ';'
      },
      //
      dist: {
        files: {
          '<%= mifosx.dist %>/<%=mifosx.target%>/scripts/controllers/controllers.js': ['<%= mifosx.app %>/scripts/controllers/**/*.js'],
          '<%= mifosx.dist %>/<%=mifosx.target%>/scripts/directives/directives.js': ['<%= mifosx.app %>/scripts/directives/**/*.js'],
          '<%= mifosx.dist %>/<%=mifosx.target%>/scripts/models/models.js': ['<%= mifosx.app %>/scripts/models/**/*.js'],
          //'<%= mifosx.dist %>/<%=mifosx.target%>/scripts/services/services.js': ['<%= mifosx.app %>/scripts/services/**/*.js'],
          '<%= mifosx.dist %>/<%=mifosx.target%>/scripts/filters/filters.js': ['<%= mifosx.app %>/scripts/filters/**/*.js'],
          '<%= mifosx.dist %>/<%=mifosx.target%>/scripts/routes-initialTasks-webstorage-configuration.js':
          ['<%= mifosx.app %>/scripts/routes.js',
          '<%= mifosx.app %>/scripts/initialTasks.js',
          '<%= mifosx.app %>/scripts/webstorage-configuration.js']
        }
      }
    },
    //FIXME: Address issues with requirejs task
    requirejs: {
      compile: {
        options: {
          baseUrl: '<%= mifosx.app %>',
          mainConfigFile: '<%= mifosx.app %>/scripts/loader.js',
          out: '<%= mifosx.dist %>/<%=mifosx.target%>/loader.js'
        }
      }
    },

    devcode: {
      options: {
        html: true,        // html files parsing?
        js: true,          // javascript files parsing?
        css: false,         // css files parsing?
        clean: true,       // removes devcode comments even if code was not removed
        block: {
          open: 'devcode', // with this string we open a block of code
          close: 'endcode' // with this string we close a block of code
        },
        dest: 'dist'       // default destination which overwrittes environment variable
      },
      dist : {             // settings for task used with 'devcode:dist'
        options: {
            source: 'dist/',
            dest: 'dist/',
            env: 'production'
        }
      }
    },
    "merge-json": {
        "json": {
            src: [ "app/release.json","app/version.json" ],
            dest: "app/release.json"
        },
    }
  });
  grunt.loadNpmTasks('grunt-license-report');
  //versioning
  grunt.registerTask('saveRevision', function() {

    grunt.task.requires('gitinfo');

    var status = grunt.config('gitinfo.status');
    //var branch = grunt.config('gitinfo.local.branch.current.name');
    var localSha = grunt.config('gitinfo.local.branch.current.SHA');
    var localShortSha = grunt.config('gitinfo.local.branch.current.shortSHA');
    var lastCommitTime = grunt.config('gitinfo.local.branch.current.lastCommitTime');
    var lastCommitDate = new Date(Date.parse(lastCommitTime));
    var lastCommitDateStr = lastCommitDate.toLocaleDateString();
    var lastCommitYear = lastCommitDate.getFullYear();
    var fullBranch= grunt.config('gitinfo.fullBranch');
    var tag = grunt.config('gitinfo.local.branch.current.tag');
    var localbranch = grunt.config('gitinfo.local.branch.current.name');

    var branch =  !!fullBranch ? fullBranch.split(/[//]+/).pop():grunt.config('gitinfo.local.branch.current.name');
    
    grunt.log.writeln("fullBranch: " + fullBranch);
    grunt.log.writeln("localSha: " + localSha);
    grunt.log.writeln("localShortSha: " + localShortSha);
    grunt.log.writeln("lastCommitDate: " + lastCommitDate);
    grunt.log.writeln("tag: " + tag);
    grunt.log.writeln("branch: " + branch)
    grunt.log.writeln("localbranch: " + localbranch)
    grunt.file.write('app/version.json', JSON.stringify({
      version: localbranch,
            commit: localShortSha,
            releasedate: lastCommitDateStr,
            releaseyear: lastCommitYear,
            branch:branch,
            tag:tag
     }));
    grunt.task.run('merge-json');
  
    // grunt.event.once('gitinfo', function (rev) {
    //   grunt.file.write('app/version.json', rev);
    //   grunt.task.run('merge-json');
    // });
    
  });

  // Run development server using grunt serve
  grunt.registerTask('serve', ['gitinfo','saveRevision','clean:server', 'copy:server', 'connect:livereload', 'watch']);
  
  // Validate JavaScript and HTML files
  grunt.registerTask('validate', ['jshint:all', 'validation']);
  
  // Default task(s).
  grunt.registerTask('default', ['clean', 'jshint', 'copy:dev']);
  grunt.registerTask('prod', ['gitinfo','saveRevision', 'clean','copy:prod', 'concat', 'uglify:prod', 'devcode:dist', 'hashres','replace']);
  grunt.registerTask('dev', ['clean', 'copy:dev']);
  grunt.registerTask('test', ['karma']);
  grunt.registerTask('git-version', ['gitinfo','saveRevision']);
  grunt.registerTask('license-report', ['grunt-license-report']);

};
