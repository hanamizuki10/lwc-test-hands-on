import { createElement } from 'lwc';
import MySimpleTable from 'c/mySimpleTable';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';

const mockGetObjectInfoError = require('./data/getObjectInfo_Error.json');

// Account
// type:Name, phone, number, address, picklist, url, date
const mockGetObjectInfoByAccount = require('./data/Account/getObjectInfo.json');
const mockApiRecordsByAccount = require('./data/Account/api_records.json');
const mockExpectedColumnsByAccount = require('./data/Account/expected_columns.json');

// Case
// type:Id, picklist, email
const mockGetObjectInfoByCase = require('./data/Case/getObjectInfo.json');
const mockApiRecordsByCase = require('./data/Case/api_records.json');
const mockExpectedColumnsByCase = require('./data/Case/expected_columns.json');

jest.mock(
  'lightning/flowSupport',
  () => {
    return { FlowAttributeChangeEvent: {} };
  },
  { virtual: true }
);

describe('c-my-simple-table', () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('基本ケース', async () => {
    const element = createElement('c-my-simple-table', {
      is: MySimpleTable
    });
    element.records = mockApiRecordsByAccount;
    element.height = '200';
    element.objectName = 'Account';
    document.body.appendChild(element);

    // Emit data from @wire
    await getObjectInfo.emit(mockGetObjectInfoByAccount);

    // アサーション
    const divEl = element.shadowRoot.querySelector('div');
    // eslint-disable-next-line @lwc/lwc/no-inner-html
    expect(divEl.outerHTML).toBe(
      '<div style="height: 200px"><lightning-datatable></lightning-datatable></div>'
    );
    const dbEl = element.shadowRoot.querySelector('lightning-datatable');
    const expectedData = JSON.stringify(mockApiRecordsByAccount);
    const receivedDate = JSON.stringify(dbEl.data);
    const expectedColumns = JSON.stringify(mockExpectedColumnsByAccount);
    const receivedColumns = JSON.stringify(dbEl.columns);
    expect(dbEl.keyField).toBe('id');
    expect(receivedDate).toBe(expectedData);
    expect(receivedColumns).toBe(expectedColumns);
  });

  it('height未指定のケース', async () => {
    const element = createElement('c-my-simple-table', {
      is: MySimpleTable
    });
    element.records = mockApiRecordsByAccount;
    element.height = '';
    element.objectName = 'Account';
    document.body.appendChild(element);

    // Emit data from @wire
    await getObjectInfo.emit(mockGetObjectInfoByAccount);

    // アサーション
    const divEl = element.shadowRoot.querySelector('div');
    // eslint-disable-next-line @lwc/lwc/no-inner-html
    expect(divEl.outerHTML).toBe('<div><lightning-datatable></lightning-datatable></div>');
  });

  it('データなしのケース', async () => {
    const element = createElement('c-my-simple-table', {
      is: MySimpleTable
    });
    element.records = [];
    element.height = '200';
    element.objectName = 'Account';
    document.body.appendChild(element);

    // Emit data from @wire
    await getObjectInfo.emit(mockGetObjectInfoByAccount);

    // アサーション
    const divEl = element.shadowRoot.querySelector('div');
    // eslint-disable-next-line @lwc/lwc/no-inner-html
    expect(divEl.outerHTML).toBe('<div class="slds-m-around_x-small">データはありません。</div>');
  });

  it('Nameが存在せずIdのみのケース', async () => {
    const element = createElement('c-my-simple-table', {
      is: MySimpleTable
    });
    element.records = mockApiRecordsByCase;
    element.height = '200';
    element.objectName = 'Case';
    document.body.appendChild(element);

    // Emit data from @wire
    await getObjectInfo.emit(mockGetObjectInfoByCase);

    // アサーション
    const dbEl = element.shadowRoot.querySelector('lightning-datatable');
    const expectedData = JSON.stringify(mockApiRecordsByCase);
    const receivedDate = JSON.stringify(dbEl.data);
    const expectedColumns = JSON.stringify(mockExpectedColumnsByCase);
    const receivedColumns = JSON.stringify(dbEl.columns);
    expect(dbEl.keyField).toBe('id');
    expect(receivedDate).toBe(expectedData);
    expect(receivedColumns).toBe(expectedColumns);
  });


  it('ローディング中の表示確認', async () => {
    const element = createElement('c-my-simple-table', {
      is: MySimpleTable
    });
    element.records = mockApiRecordsByAccount;
    element.height = '200';
    element.objectName = 'Account';
    document.body.appendChild(element);

    // アサーション
    const divEl = element.shadowRoot.querySelector('div');
    // eslint-disable-next-line @lwc/lwc/no-inner-html
    expect(divEl.innerHTML).toBe('<lightning-spinner></lightning-spinner>');
  });

  it('getObjectInfoでエラー発生ケース', async () => {
    const element = createElement('c-my-simple-table', {
      is: MySimpleTable
    });
    element.fieldNames = '';
    element.records = mockApiRecordsByAccount;
    element.height = '200';
    element.objectName = 'Account';
    document.body.appendChild(element);

    // error data from @wire
    await getObjectInfo.error(mockGetObjectInfoError);

    // アサーション
    const divEl = element.shadowRoot.querySelector('div.slds-theme_error');
    expect(divEl.className).toBe('slds-scoped-notification slds-media slds-media_center slds-theme_error');
    expect(divEl.childElementCount).toBe(2);
    expect(divEl.children[1].className).toBe('slds-media__body');
    const divBody = divEl.children[1];
    expect(divBody.childElementCount).toBe(2);
    // eslint-disable-next-line @lwc/lwc/no-inner-html
    expect(divBody.children[0].outerHTML).toBe('<p>【MySimpleTable Component Error】An error occurred when retrieving the data.</p>');
    expect(divBody.children[1].className).toBe('slds-p-left_medium slds-list_dotted');
    const errUiList = divBody.children[1];
    expect(errUiList.childElementCount).toBe(2);

    // eslint-disable-next-line @lwc/lwc/no-inner-html
    expect(errUiList.children[0].outerHTML).toBe('<li>403:INSUFFICIENT_ACCESS:このレコードへのアクセス権がありません。システム管理者にサポートを依頼するか、アクセス権を要求してください。</li>');
    // eslint-disable-next-line @lwc/lwc/no-inner-html
    expect(errUiList.children[1].outerHTML).toBe('<li>error method: getObjectInfo<span> (objectApiName=Account) </span></li>');
  });
});
