import { Component, OnInit } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  public selectedIndex = 0;
  public appPages = [
    {
      title: 'Home',
      url: '/folder/Home',
      icon: 'home'
    },
    {
      title: 'My Schedule',
      url: '/folder/My Schedule',
      icon: 'calendar'
    },
    {
      title: 'What Goes Where?',
      url: '/search',
      icon: 'search-circle'
    },
    {
      title: 'News',
      url: '/folder/News',
      icon: 'newspaper'
    },
    {
      title: 'TCNJ Resources',
      url: '/folder/TCNJ Resources',
      icon: 'link'
    },
    {
      title: 'Report an Issue',
      url: '/folder/Report an Issue',
      icon: 'help-circle'
    },
    {
      title: 'Settings',
      url: '/folder/Settings',
      icon: 'settings'
    }
  ];
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  ngOnInit() {
    const path = window.location.pathname.split('folder/')[1];
    if (path !== undefined) {
      this.selectedIndex = this.appPages.findIndex(page => page.title.toLowerCase() === path.toLowerCase());
    }
  }
}
