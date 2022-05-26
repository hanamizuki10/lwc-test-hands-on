import { LightningElement, api, wire } from 'lwc';
import { FlowAttributeChangeEvent } from 'lightning/flowSupport';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';

export default class MySimpleTable extends LightningElement {
  @api records;
  @api height;
  @api objectName;
  @api selectedRecords;

  columns;
  wiredObjectInfo;
  errorInfo = null;

  // データの有無返却
  get hasRecords() {
    return (this.records && this.records.length > 0);
  }

  // 表形式の列名となる項目一覧を取得
  get displayFieldNames() {
    // 引き渡されたレコードに存在する項目を利用する
    return (this.hasRecords) ? Object.keys(this.records[0]) : [];
  }

  // 表の高さCSSスタイルを返却
  get style() {
    if (!this.height || this.height === 0) return ''; // 最低限表示する
    return 'height: ' + this.height + 'px';
  }

  // サーバー問い合わせ中であるか返却
  get isLoading() {
    if (this.errorInfo) return false; //  エラー発生中ではない
    return !(this.wiredObjectInfo && this.wiredObjectInfo.data);
  }

  // 項目情報を返却
  get fieldInfos() {
    return this.wiredObjectInfo?.data?.fields;
  }

  // wireサービスを利用して指定オブジェクトの定義情報を取得する
  @wire(getObjectInfo, { objectApiName: '$objectName' })
  wiredObjectInfoCallback(value) {
    this.wiredObjectInfo = value;
    const { data, error } = value;
    if (data) {
      this.errorInfo = null;
      this._initializationColumns();
    } else if (error) {
      console.error(error);
      this.errorInfo = {
        message: error.body.statusCode + ':' + error.body.errorCode + ':' + error.body.message,
        method: 'getObjectInfo',
        arguments: 'objectApiName=' + this.objectName
      };
    }
  }

  // 表形式の列情報を初期化
  _initializationColumns() {
    this.columns = this.displayFieldNames
      .filter((apiName) => !['Id', 'Name'].includes(apiName))
      .map((apiName) => {
        const column = {
          fieldName: apiName,
          label: this.fieldInfos[apiName].label,
          type: 'text'
        };
        return column;
      });

    if (this.displayFieldNames.includes('Name')) {
      // 先頭にNameを表示する
      this.columns.unshift({
        fieldName: 'Name',
        label: this.fieldInfos.Name.label,
        type: 'text'
      });
    } else {
      // Nameが存在しない場合はIdを表示する
      this.columns.unshift({
        fieldName: 'Id',
        label: this.fieldInfos.Id.label,
        type: 'text'
      });
    }
  }

  // 選択された行の情報をselectedRecordsにセット
  handleSelectedRow(event) {
    const selectedRows = event.detail.selectedRows;
    this.dispatchEvent(new FlowAttributeChangeEvent('selectedRecords', selectedRows));
  }
}