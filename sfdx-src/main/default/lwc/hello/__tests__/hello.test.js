import { createElement } from 'lwc';
import Hello from 'c/hello';

describe('c-hello', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('welcomeメッセージが表示されることを確認', () => {
        const element = createElement('c-hello', {
            is: Hello
        });
        element.name = 'Hanamizuki';
        document.body.appendChild(element);
        // 展開された情報が指定引数をもとに展開されているか確認する
        const spanEl = element.shadowRoot.querySelector('span.welcome-message');
        expect(spanEl.innerHTML).toBe('Hello, Hanamizuki!');
    });
});