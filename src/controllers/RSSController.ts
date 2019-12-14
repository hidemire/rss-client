import * as fs from "fs";
import { inject, injectable } from "inversify";
import { isArray } from "util";
import * as xmlParser from "xml-js";

import { remote } from "electron";
import News from "../models/News";
import MainView from "../views";

const { dialog } = remote;

@injectable()
export default class RSSController {
  private mainView: MainView;
  private file: any;
  private XMLFIle: Buffer;
  private jsRSS: any;
  private news: News[] = [];

  constructor(@inject("MainView") mainView: MainView) {
    this.mainView = mainView;
  }

  public setup(): void {
    this.mainView.on("onFileSelect", (file) => {
      this.file = file;
      this.news = [];

      try {
        this.XMLFIle = fs.readFileSync(file.path);
        this.jsRSS = xmlParser.xml2js(this.XMLFIle.toString(), { compact: true });
        this.news = this.getAllNews(this.jsRSS);
      } catch (error) {
        dialog.showMessageBoxSync({ type: "warning", message: "Помилка зчитування файлу" });
      }

      this.mainView.renderNews(this.news);
    });

    this.mainView.on("onFileSave", () => {
      this.jsRSS.channel.items.item = null;
      if (this.news.length > 1) {
        this.jsRSS.channel.items.item = [];
        this.news.forEach((item: News) => {
          this.jsRSS.channel.items.item.push({
            description: { _text: item.description },
            link: { _text: item.link },
            title: { _text: item.title },
            // tslint:disable-next-line: object-literal-sort-keys
            _attributes: { "rdf:about": "https://www.xul.fr/en/news.rdf" },
          });
        });
      } else {
        this.jsRSS.channel.items.item = {
          description: { _text: this.news[0].description },
          link: { _text: this.news[0].link },
          title: { _text: this.news[0].title },
          // tslint:disable-next-line: object-literal-sort-keys
          _attributes: { "rdf:about": "https://www.xul.fr/en/news.rdf" },
        };
      }
      const xml = xmlParser.js2xml(this.jsRSS, {compact: true, ignoreComment: true, spaces: 2});
      fs.writeFileSync(this.file.path, xml);
    });

    this.mainView.on("onNewsDelete", ({ newsId }) => {
      this.deleteNews(newsId);
      this.mainView.renderNews(this.news);
    });

    this.mainView.on("onEdit", (news: News) => {
      this.editNews(news);
      this.mainView.renderNews(this.news);
    });

    this.mainView.on("onCreate", (news: any) => {
      this.createNews(news);
      this.mainView.renderNews(this.news);
    });
  }

  private getAllNews(jsRSS: any): News[] {
    const newses: News[] = [];
    const {
      channel: {
        items: {
          item,
        },
      },
    } = jsRSS;

    if (isArray(item)) {
      item.forEach((news: any) => {
        newses.push(new News({
          description: news.description._text,
          link: news.link._text,
          title: news.title._text,
        }));
      });
    } else {
      newses.push(new News({
        description: item.description._text,
        link: item.link._text,
        title: item.title._text,
      }));
    }

    return newses;
  }

  private createNews(news: any) {
    this.news.push(new News({
      description: news.description,
      link: news.link,
      title: news.title,
    }));
  }

  private editNews(news: News) {
    this.news = this.news.map((item: News) => {
      if (item.id === news.id) {
        item = news;
      }
      return item;
    });
  }

  private deleteNews(id: string) {
    this.news = this.news.filter((item) => item.id !== id);
  }
}
