/* eslint-disable @typescript-eslint/no-explicit-any */
import { GetLogOptions } from '@/components/LogComp/types/LogConditionClass';
import { SaleAndProductionListItemPlainType } from '@/views/serverManage/utils/SaleAndProductionListItemClass';
import { SwitchListItemPlainType } from '@/views/serverManage/utils/SwitchListItemClass';
import { ServerTypeEnum } from '@/views/serverManage/utils/types';
import instance from './axios';

const api = {
  /* 用户相关
  ------------------------------- */
  getLogin(data: any) {
    return instance.post('/Api/Staff/Login', data, { withoutToken: true });
  },
  getUser<T = any>() {
    return instance.post<T>('/Api/Staff/Detail');
  },
  /* 销售端 & 生产端
  ------------------------------- */
  getServerList(type?: ServerTypeEnum) { // GET /Api/Server/List  获取服务器列表
    return instance.get('/Api/Server/List', { params: { type } });
  },
  getServerSave(data: Partial<SaleAndProductionListItemPlainType>) { // POST /Api/Server/Save  服务器(销售端/生产端)信息保存
    return instance.post<string>('/Api/Server/Save', data);
  },
  getServerRemove(id: number) { // DELETE /Api/Server/Remove   服务器(销售端/生产端)信息删除
    return instance.delete('/Api/Server/Remove', { params: { id } });
  },
  getServerGenerateSecretKey(id: number) { // PUT /Api/Server/GenerateSecretKey  服务器生成密钥
    return instance.put('/Api/Server/GenerateSecretKey', null, { params: { id } });
  },
  getLogList(data: GetLogOptions) { // POST /Api/Log/List   获取操作日志列表
    return instance.post('/Api/Log/List', data, { loading: false });
  },
  getConvertServerList() { // GET /Api/ConvertServer/List  获取转换服务器列表
    return instance.get('/Api/ConvertServer/List');
  },
  getConvertServerSave(data: Partial<SwitchListItemPlainType>) { // POST /Api/ConvertServer/Save   转换器信息保存
    return instance.post('/Api/ConvertServer/Save', data);
  },
  getConvertServerRemove(id: string) { // DELETE /Api/ConvertServer/Remove   转换服务器信息删除
    return instance.delete('/Api/ConvertServer/Remove', { params: { id } });
  },
  getConvertServerNotifyReceiveSetup(data: Partial<SwitchListItemPlainType>) { // POST /Api/ConvertServer/NotifyReceiveSetup  转换器转换失败通知设置
    return instance.post('/Api/ConvertServer/NotifyReceiveSetup', data);
  },
};

export default api;
