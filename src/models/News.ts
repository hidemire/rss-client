interface INews {
  title: string;
  description: string;
  link: string;
}

class News {
  public id: string;
  public title: string;
  public description: string;
  public link: string;

  constructor({ title, description, link }: INews) {
    this.id = Math.random().toString(16).slice(-6);
    this.title = title || "";
    this.description = description || "";
    this.link = link || "";
  }
}

export default News;
