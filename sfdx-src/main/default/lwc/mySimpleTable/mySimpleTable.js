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

  get hasRecords() {
    return (this.records && this.records.length > 0);
  }

  get hasNoRecords() {
    return !this.hasRecords;
  }

  get displayFieldNames() {
    // 引き渡されたレコードに存在する項目を利用する
    return (this.hasRecords) ? Object.keys(this.records[0]) : [];
  }

  get style() {
    if (!this.height || this.height === 0) return ''; // 最低限表示する
    return 'height: ' + this.height + 'px';
  }

  get fieldInfos() {
    return this.wiredObjectInfo?.data?.fields;
  }

  get isLoading() {
    if (this.errorInfo) return false; //  エラー発生中ではない
    return !(this.wiredObjectInfo && this.wiredObjectInfo.data);
  }

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

  _initializationColumns() {
    this.columns = this.displayFieldNames
      .filter((apiName) => !['Id', 'Name'].includes(apiName))
      .map((apiName) => this._generateColumn(apiName));

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

  _generateColumn(apiName) {
    const column = {
      fieldName: apiName,
      label: this.fieldInfos[apiName].label,
      type: 'text'
    };
    return column;
  }


  handleSelectedRow(event) {
    const selectedRows = event.detail.selectedRows;
    this.dispatchEvent(new FlowAttributeChangeEvent('selectedRecords', selectedRows));
  }
}