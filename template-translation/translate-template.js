const fs = require("fs");

class TemplateTranslation {
  constructor(prevVersion, version) {
    this.prevVersion = prevVersion,
    this.version = version,
    this.languages = ["en", "es"]
  }

  async generateUpdatedTemplates(){
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
    const dictionary = {...originalDictionary};
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
    const template = await this.readFile(`master-template.json`);
    console.warn("template", Object.keys(template));
    const originalDictionary = {};
    const dictionary = {...originalDictionary};
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

  async createNewTemplate(language) {
    const template = await this.readFile("./master-template.json");
    const translateTemplate = {...template};
    const dictionary = await this.readFile(`./${this.version}/template-dictionary-${this.version}.json`);
    translateTemplate.states.forEach((state) => {
      if(state.properties && state.properties.body) {
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
    return {
      type: templateState.type,
      dictionary: {
        es: templateState.properties && templateState.properties.body,
        en: ""
      }
    }
  }
}

// Use the previous version and the current version
const translation = new TemplateTranslation("1.0", "1.1");
translation.generateUpdatedTemplates();