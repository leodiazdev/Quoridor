import { i18n } from '../i18n/translations.js';

export class TutorialModal {
  private modalElement: HTMLElement;
  private dontShowCheckbox: HTMLInputElement;
  private closeBtn: HTMLElement;
  private gotItBtn: HTMLElement;

  constructor() {
    this.modalElement = document.getElementById('tutorialModal')!;
    this.dontShowCheckbox = document.getElementById('tutorialDontShowCheckbox') as HTMLInputElement;
    this.closeBtn = document.getElementById('tutorialCloseBtn')!;
    this.gotItBtn = document.getElementById('tutorialGotItBtn')!;

    this.gotItBtn.addEventListener('click', () => this.hide());
    this.closeBtn.addEventListener('click', () => this.hide());
  }

  public checkAutoShow() {
    const dontShow = localStorage.getItem('quoridor_dont_show_tutorial');
    if (!dontShow) {
      this.show();
    }
  }

  public show() {
    this.updateLanguage();
    this.modalElement.classList.remove('hidden');
    this.modalElement.classList.add('flex');
  }

  public hide() {
    if (this.dontShowCheckbox.checked) {
      localStorage.setItem('quoridor_dont_show_tutorial', 'true');
    }
    this.modalElement.classList.remove('flex');
    this.modalElement.classList.add('hidden');
  }

  public updateLanguage() {
    document.getElementById('tutorialTitle')!.textContent = i18n.t('tutorialTitle');
    document.getElementById('tutorialSubtitle')!.textContent = i18n.t('tutorialSubtitle');

    document.getElementById('tutorialStep1Title')!.textContent = i18n.t('tutorialStep1Title');
    document.getElementById('tutorialStep1Desc')!.textContent = i18n.t('tutorialStep1Desc');

    document.getElementById('tutorialStep2Title')!.textContent = i18n.t('tutorialStep2Title');
    document.getElementById('tutorialStep2Desc')!.textContent = i18n.t('tutorialStep2Desc');

    document.getElementById('tutorialStep3Title')!.textContent = i18n.t('tutorialStep3Title');
    document.getElementById('tutorialStep3Desc')!.textContent = i18n.t('tutorialStep3Desc');

    document.getElementById('tutorialStep4Title')!.textContent = i18n.t('tutorialStep4Title');
    document.getElementById('tutorialStep4Desc')!.textContent = i18n.t('tutorialStep4Desc');

    document.getElementById('tutorialGotItBtn')!.textContent = i18n.t('tutorialGotItBtn');
    document.getElementById('tutorialDontShowLabel')!.textContent = i18n.t('tutorialDontShow');
  }
}
