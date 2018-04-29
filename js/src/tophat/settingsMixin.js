/**
 *
 * settings
 *
 */

var settingsMixin = {

    methods: {

        clickSettingsMenu: function (e) {

            if (this.settings_show == false) {
                this.$set(this, 'settings_show', true);
            }
            else {
                this.$set(this, 'settings_show', false);
            }
        },

        clickSettings: function (e) {

            var act = e.target.getAttribute('data-act');

            if (!act) {
                return;
            }

            switch (act) {

                case 'closeTail':

                    if (e.target.checked) {

                        this.settings.closeTail = true;
                    }
                    else {
                        this.settings.closeTail = false;
                    }

                    break;

            }

            this.settingsWrite();
        },

        settingsRead: function () {

            this.fileReadToJSON(param.settingsFileName, function (settings) {

                if (!settings) {
                    settings = {};
                }

                for (var i in settings) {
                    // this.$set(this.settings, i, settings[i]);
                    this.settings[i] = settings[i];
                }

            }.bind(this));
        },

        settingsWrite: function () {

            var filePath = path.join(os.homedir(), '.' + param.programName, param.settingsFileName);

            var settings = JSON.stringify(this.settings);

            fs.writeFile(filePath, settings, function (err) {

                if (err) {
                    throw err;
                }

                this.console(lang.settings.saved);

            }.bind(this));
        },

    }
}