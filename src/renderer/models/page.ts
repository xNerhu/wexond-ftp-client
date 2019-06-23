import { observable } from 'mobx';
import { IFile } from 'qusly-core';

import store from '../store';
import { Session } from './session';

export class Page {
  @observable
  public tabId = store.tabs.selectedTab.id;

  @observable
  public files: IFile[] = [];

  @observable
  public pathItems: string[] = [];

  @observable
  public loading = true;

  constructor(public session: Session) { }

  public async load() {
    const { path } = await this.session.client.pwd();
    const slash = path.startsWith('/') ? '/' : '';

    this.pathItems = [slash, ...path.split(/\\|\//).filter(v => v !== '')];

    await this.fetchFiles();
  }

  public async fetchFiles() {
    this.loading = true;

    const path = this.path;
    const { files } = await this.session.client.readDir(path);

    await store.favicons.load(files);

    this.files = files;
    this.loading = false;

    store.tabs.getTabById(this.tabId).title = `${this.session.site.title} - ${path.substring(1)}`;
  }

  public get path() {
    return this.pathItems.join('/');
  }
}
