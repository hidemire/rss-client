import { remote, shell } from "electron";
import { EventEmitter } from "events";
import { decorate, injectable } from "inversify";
import News from "../models/News";

const { dialog } = remote;

const newsTemplate = (news: News): string => (`<div class="col-md-4">
<div class="card mb-4 shadow-sm">
  <svg id="link-${news.id}" class="bd-placeholder-img card-img-top" width="100%" height="225" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img" aria-label="Placeholder: Thumbnail"><title>Placeholder</title><rect fill="#55595c" width="100%" height="100%"></rect><text fill="#eceeef" dy=".3em" x="10%" y="50%">${news.title}</text></svg>
  <div class="card-body">
    <p class="card-text">${news.description}</p>
    <div class="d-flex justify-content-between align-items-center">
      <div class="btn-group">
        <button id="delete-${news.id}" type="button" class="btn btn-sm btn-outline-secondary">Delete</button>
        <button id="edit-${news.id}" type="button" data-toggle="modal" data-target="#exampleModal" class="btn btn-sm btn-outline-secondary">Edit</button>
      </div>
      <small class="text-muted">${news.id}</small>
    </div>
  </div>
</div>
</div>`);

decorate(injectable(), EventEmitter);

@injectable()
class MainView extends EventEmitter {
  private news: News[] = [];

  public setup(): void {
    document.querySelector("#load-ssr-btn").addEventListener("click", async () => {
      const files = await dialog.showOpenDialog({properties: ["openFile"]});
      if (files.filePaths.length !== 0) {
        this.emit("onFileSelect", { path: files.filePaths[0] });
      }
    });
    document.querySelector("#save-ssr-btn").addEventListener("click", async () => {
      this.emit("onFileSave");
    });
    document.querySelector("#create-save").addEventListener("click", async () => {
      this.emit("onCreate", {
        description: (document.querySelector("#create-description") as HTMLInputElement).value,
        link: (document.querySelector("#create-link") as HTMLInputElement).value,
        title: (document.querySelector("#create-title") as HTMLInputElement).value,
      });
    });
    document.querySelector("#statistic-ssr-btn").addEventListener("click", async () => {
      if (this.news.length > 0) {
        const count = this.news.length;
        const maxDescriptionId = this.news[this.news.reduce((prev: number, item: News, index: number) => {
          if (this.news[index].description.length > this.news[prev].description.length) {
            return index;
          }
          return prev;
        }, 0)].id;
        const minTitleId = this.news[this.news.reduce((prev: number, item: News, index: number) => {
          if (this.news[index].title.length < this.news[prev].title.length) {
            return index;
          }
          return prev;
        }, 0)].id;
        document.querySelector("#news-count").innerHTML = `Кількість новин: ${count}`;
        document.querySelector("#max-description-news").innerHTML = `Максимальний опис ID: ${maxDescriptionId}`;
        document.querySelector("#min-title-news").innerHTML = `Мінімальний заголовок ID: ${minTitleId}`;
      }
    });
  }

  public renderNews(news: News[]) {
    this.news = news;
    const newsContainer = document.querySelector("#news-container");
    newsContainer.innerHTML = "";
    news.forEach((newsItem: News) => {
      newsContainer.insertAdjacentHTML("beforeend", newsTemplate(newsItem));
      document.querySelector(`#delete-${newsItem.id}`)
        .addEventListener("click", this.deleteNews.bind(this, newsItem.id));
      document.querySelector(`#edit-${newsItem.id}`)
        .addEventListener("click", this.editNews.bind(this, newsItem));
      document.querySelector(`#link-${newsItem.id}`)
        .addEventListener("click", this.openLink.bind(this, newsItem.link));
    });
  }

  public deleteNews(id: string) {
    this.emit("onNewsDelete", { newsId: id });
  }

  public openLink(link: string) {
    shell.openExternal(link);
  }

  public editNews(news: News) {
    (document.querySelector("#edit-title") as HTMLInputElement).value = news.title;
    (document.querySelector("#edit-description") as HTMLInputElement).value = news.description;
    (document.querySelector("#edit-link") as HTMLInputElement).value = news.link;
    document.querySelector("#edit-news-id").innerHTML = news.id;
    document.getElementById("edit-save").onclick = () => {
      this.emit("onEdit", {
        description: (document.querySelector("#edit-description") as HTMLInputElement).value,
        id: news.id,
        link: (document.querySelector("#edit-link") as HTMLInputElement).value,
        title: (document.querySelector("#edit-title") as HTMLInputElement).value,
      } as News);
    };
  }
}

export default MainView;
