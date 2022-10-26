import api from '@/api';
import { message } from '@/assets/js/message';
import { AssistInfoTypeEnum, AssistMappingTypeEnum, FixedType } from '@/store/modules/transformer/map/enum';
import { MapDataClass } from '@/store/modules/transformer/map/MapDataClass';
import { AssistMapItemClass } from '@/store/modules/transformer/map/AssistMapItemClass';
import { IPropertyType } from '@/store/modules/transformer/map/types';
import { getPerfectPropertyByImperfectProperty } from '@/assets/js/property';

export interface IWorkTimesLeftType {
  ID: string | number
  Name: string
}

export enum DisplayTypeEnum {
  Element = '00 元素', // 前方为展示的顺序， 后面为展示的名称
  Group = '01 元素组',
  Craft = '02 工艺',
  MaterialAndSize = '03 尺寸物料',
}

export interface IWorkTimesRightType extends IPropertyType {
  _ID: string | FixedType
  _Name: string
  _DisplayType: DisplayTypeEnum
}

/**
 * 为属性添加上_ID _Name _DisplayType 等信息
 *
 * @param {IPropertyType} it
 * @returns {(IWorkTimesRightType | null)}
 */
const transformProperty = (it: IPropertyType): IWorkTimesRightType | null => {
  const temp: Pick<IWorkTimesRightType, '_ID' | '_Name' | '_DisplayType'> = {
    _ID: '',
    _Name: '',
    _DisplayType: DisplayTypeEnum.Element,
  };
  if (it.Element) { // 元素类型
    temp._DisplayType = DisplayTypeEnum.Element;
    temp._ID = it.Element.ID;
    temp._Name = it.Element.Name;
  } else if (it.Group) { // 多次使用的元素组
    temp._DisplayType = DisplayTypeEnum.Group;
    temp._ID = it.Group.ID;
    temp._Name = it.Group.Name;
  } else if (it.Craft) { // 工艺类型
    temp._DisplayType = DisplayTypeEnum.Craft;
    temp._ID = it.Craft.ID;
    temp._Name = it.Craft.Name;
  } else if (typeof it.FixedType === 'number') { // 尺寸、物料等
    switch (it.FixedType) {
      case FixedType.Material:
        temp._DisplayType = DisplayTypeEnum.MaterialAndSize;
        temp._ID = FixedType.Material;
        temp._Name = '物料';

        break;
      case FixedType.Size:
        temp._DisplayType = DisplayTypeEnum.MaterialAndSize;
        temp._ID = FixedType.Size;
        temp._Name = '尺寸';

        break;
      default:
        break;
    }
  }
  if (!temp._ID) return null;
  return { ...it, ...temp };
};

export class WorkTimesMapClass extends MapDataClass<IWorkTimesLeftType, IWorkTimesRightType, IWorkTimesRightType[]> {
  visible = false

  setVisible = (bool: boolean) => {
    this.visible = bool;
  }

  public getItemMapResult(id: string, mapList: AssistMapItemClass[]) {
    const _mapList = mapList || this.mapDataList;
    const t = _mapList.find(it => it.SourceID === id || it.SourceID === `${id}`);
    if (!t) return '无';
    return t.TargetProperty.map((p) => {
      const _p = p as IWorkTimesRightType;
      return _p._Name;
    }).join('、') || '无';
  }

  public async saveItem(TargetProperty: IWorkTimesRightType[]): Promise<void> {
    const ProductID = this.curPageData?.curEditItem?.ID || '';
    const InstanceID = this.curPageData?.curPart?.ID || ProductID;
    const temp = {
      ServerID: this.ServerID,
      Type: AssistMappingTypeEnum.WorkTimes,
      SourceID: this.curEditItem?.ID || '',
      TargetProperty,
      ProductID,
      InstanceID,
    };
    const resp = await api.getAssistMappingSave(temp).catch(() => null);
    if (resp?.data.Status === 1000) {
      const cb = () => {
        this.visible = false;
        this.handleItemChange(temp);
      };
      message.success({
        title: '设置成功',
        onOk: cb,
        onCancel: cb,
      });
    }
  }

  /**
   * 获取左侧列表数据
   *
   * @protected
   * @returns
   * @memberof WorkTimesMapClass
   */
  protected async getLeftList() {
    const resp = await api.getAssistantInfoList(this.ServerID, AssistInfoTypeEnum.text).catch(() => null);
    return resp?.data.Status === 1000 ? resp.data.Data : [];
  }

  /**
   * 获取右侧列表数据
   *
   * @protected
   * @returns
   * @memberof WorkTimesMapClass
   */
  protected async getRightList() {
    const productID = this.curPageData?.curEditItem?.ID || '';
    const partID = this.curPageData?.curPart?.ID || undefined;
    const resp = await api.getSellProductProperty(this.ServerID, productID, partID).catch(() => null);
    const list = resp?.data.Status === 1000 ? resp.data.Data : [];
    return list.map(transformProperty).filter((it: IWorkTimesRightType) => it);
  }

  /**
   * 获取映射列表数据
   *
   * @protected
   * @returns
   * @memberof WorkTimesMapClass
   */
  protected async getMapList() {
    const ProductID = this.curPageData?.curEditItem?.ID || '';
    const InstanceID = this.curPageData?.curPart?.ID || ProductID;
    const temp = {
      ServerID: this.ServerID,
      Type: AssistMappingTypeEnum.WorkTimes,
      ProductID,
      InstanceID,
    };
    const resp = await api.getAssistMappingList(temp).catch(() => null);
    return resp?.data.Status === 1000 ? resp.data.Data : [];
  }

  loaded() {
    const list = this.mapDataList.map(it => ({
      ...it,
      TargetProperty: it.TargetProperty?.map(p => getPerfectPropertyByImperfectProperty(p, this.rightDataList) || p)
        .map((p) => transformProperty(p) || p) || [],
    }));
    this.mapDataList = list;
  }
}
