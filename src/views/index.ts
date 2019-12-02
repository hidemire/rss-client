import { remote } from "electron";
import { EventEmitter } from "events";
import { injectable, decorate } from "inversify";

const { dialog } = remote;

decorate(injectable(), EventEmitter);

@injectable()
class MainView extends EventEmitter {
  public setup(): void {
    document.querySelector("#load-ssr-btn").addEventListener("click", async () => {
      const files = await dialog.showOpenDialog({properties: ["openFile"]});
      if (files.filePaths.length !== 0) {
        this.emit("onFileSelect", { path: files.filePaths[0] });
      }
    });
  }

  public renderNews(news: any) {
    ///
  }
}

export default MainView;
