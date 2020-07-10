const fs = require("fs");

class TemplateTranslation {
  constructor(prevVersion, version) {
    this.prevVersion = prevVersion,
      this.version = version,
      this.masterLang = "EN",
      this.languages = ["EN", "ES-US", "FR", "AR", "Farsi", "RU", "Swahili"]
  }

  async generateUpdatedTemplates() {
    try {
      await this.makeDirectory();
      await this.createUpdatedDictionary();
      const languageTemplates = this.languages.map((language) => {
        return this.createNewTemplate(language);
      });

      await Promise.all(languageTemplates);
    } catch (error) {
      console.error("Something went wrong creates templates: ", error);
    }
  }

  async createUpdatedDictionary() {
    const template = await this.readFile(`master-template.json`);
    console.warn("template", Object.keys(template));
    const originalDictionary = await this.readFile(`${this.prevVersion}/template-dictionary-${this.prevVersion}.json`);
    const dictionary = { ...originalDictionary };
    template.states.forEach((state) => {
      if (!dictionary[state.name] && state.properties && state.properties.body) {
        console.log("Found new entry: ", state.name);
        const entry = this.createDictionaryEntry(state);
        dictionary[state.name] = entry;
      }
    });

    return fs.writeFile(`./${this.version}/template-dictionary-${this.version}.json`, JSON.stringify(dictionary), (error) => {
      console.error(error);
      return error;
    });
  }

  async createNewDictionaryFromTemplate() {
    // await this.makeDirectory();

    const template = await this.readFile(`master-template.json`);
    console.warn("template", Object.keys(template));
    const dictionary = {
      version: this.version,
      date: new Date(),
      title: "Twilio Survey Dictionary"
    };

    template.states.forEach((state) => {
      if (!dictionary[state.name] && state.properties && state.properties.body) {
        console.log("Found new entry: ", state.name);
        const entry = this.createDictionaryEntry(state);
        if((state.name).includes("error")) {
          if(!dictionary.error) {
            dictionary.error = entry;
          }
        } else {
          dictionary[state.name] = entry;
        }
      }
    });

    return fs.writeFile(`./${this.version}/template-dictionary-${this.version}.json`, JSON.stringify(dictionary), (error) => {
      console.error(error);
      return error;
    });
  }

  async createNewTemplate(language) {
    const template = await this.readFile("./master-template.json");
    const translateTemplate = { ...template };
    const dictionary = await this.readFile(`./${this.version}/template-dictionary-${this.version}.json`);
    translateTemplate.states.forEach((state) => {
      if (state.properties && state.properties.body) {
        state.properties.body = dictionary[state.name].dictionary[language];
      }
    })
    return fs.writeFile(`./${this.version}/survey-${language}-${this.version}.json`, JSON.stringify(translateTemplate), (error) => {
      console.error(error);
      return error;
    });
  }

  async readFile(path) {
    return new Promise((resolve, reject) => {
      fs.readFile(path, (error, data) => {
        if (error) {
          console.error("Error reading in file: ", path);
          reject(error);
        }
        // console.log("states", JSON.parse(data).states[0]);
        resolve(JSON.parse(data));
      })
    })
  }

  async makeDirectory(directory) {
    return new Promise((resolve, reject) => {
      fs.mkdir(this.version, (error) => {
        if (error) {
          console.error("Error making directory: ", directory);
          reject(error);
        }
        resolve();
      })
    })
  }

  createDictionaryEntry(templateState) {
    const dictionaryEntry = {
      type: templateState.type,
      dictionary: {},
    }

    const bodyParts = templateState.properties && templateState.properties.body.split("\n");

    // dictionaryEntry.dictionary[this.masterLang] = templateState.properties && templateState.properties.body;

    this.languages.forEach((language) => {
      dictionaryEntry.dictionary[language] = {};

      bodyParts.forEach((subString, i) => {
        if (i === 0) {
          if(language === this.masterLang) {
            dictionaryEntry.dictionary[language].text = subString
          } else {
            dictionaryEntry.dictionary[language].text = " "
          }
        } else {
          if (language === this.masterLang) {
            dictionaryEntry.dictionary[language][`option-${i}`] = subString;
          } else {
            dictionaryEntry.dictionary[language][`option-${i}`] = " ";
            // console.log(dictionaryEntry.dictionary[language]);
          }
        }
      });
    });

    return dictionaryEntry;
  }
}

// Use the previous version and the current version
const translation = new TemplateTranslation("1.1", "1.2");
// translation.generateUpdatedTemplates();
translation.createNewDictionaryFromTemplate();