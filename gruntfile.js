module.exports = function(grunt) {
	require("load-grunt-tasks")(grunt);	

	grunt.initConfig({
		babel: {
			compile: {
				options: {
					sourceMap: true,
					presets: ['babel-preset-es2015']
				},
				files: [{
                    "expand": true,
                    "cwd": "src/",
                    "src": ["**/*.js"],
                    "dest": "dist/",
                    "ext": ".js"
                }]
			}
		},

		watch: {
			scripts: {
				files: ["src/**/*.js"],
				tasks: ["babel"],
				options: {
					interrupt: true,
					spawn: false,
					debounceDelay: 250
				}
			}
		}
	});

	grunt.registerTask('default', ['babel']);
}