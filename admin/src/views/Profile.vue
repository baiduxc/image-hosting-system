<template>
  <div class="profile-page">
    <div class="page-header">
      <h1>个人中心</h1>
      <p>管理您的个人信息和账户设置</p>
    </div>
    
    <a-row :gutter="24">
      <!-- 左侧个人信息 -->
      <a-col :span="8">
        <a-card title="个人信息" class="profile-card">
          <div class="profile-info">
            <div class="avatar-section">
              <a-upload
                :action="uploadUrl"
                :show-file-list="false"
                @change="handleAvatarChange"
                accept="image/*"
                :headers="uploadHeaders"
              >
                <template #upload-button>
                  <div class="avatar-upload-area" :class="{ 'has-avatar': userInfo.avatar }">
                    <div v-if="userInfo.avatar" class="avatar-preview">
                      <img :src="userInfo.avatar" :alt="userInfo.nickname" />
                      <div class="avatar-overlay">
                        <icon-camera />
                        <div>更换头像</div>
                      </div>
                    </div>
                    <div v-else class="avatar-placeholder">
                      <icon-user />
                      <div class="upload-text">
                        <icon-camera />
                        <div>上传头像</div>
                      </div>
                    </div>
                  </div>
                </template>
              </a-upload>
            </div>
            
            <div class="info-section">
              <div class="info-item">
                <label>用户名：</label>
                <span>{{ userInfo.username }}</span>
              </div>
              <div class="info-item">
                <label>昵称：</label>
                <span>{{ userInfo.nickname || '未设置' }}</span>
              </div>
              <div class="info-item">
                <label>邮箱：</label>
                <span>{{ userInfo.email || '未设置' }}</span>
              </div>
              <div class="info-item">
                <label>手机：</label>
                <span>{{ userInfo.phone || '未设置' }}</span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
      
      <!-- 右侧编辑表单 -->
      <a-col :span="16">
        <a-card title="编辑信息" class="edit-card">
          <a-tabs default-active-key="info">
            <a-tab-pane key="info" title="基本信息">
              <a-form
                ref="infoFormRef"
                :model="infoForm"
                :rules="infoRules"
                layout="vertical"
                @submit="handleInfoSubmit"
              >
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item field="nickname" label="昵称">
                      <a-input
                        v-model="infoForm.nickname"
                        placeholder="请输入昵称"
                      />
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item field="email" label="邮箱">
                      <a-input
                        v-model="infoForm.email"
                        placeholder="请输入邮箱"
                      />
                    </a-form-item>
                  </a-col>
                </a-row>
                
                <a-row :gutter="16">
                  <a-col :span="12">
                    <a-form-item field="phone" label="手机号码">
                      <a-input
                        v-model="infoForm.phone"
                        placeholder="请输入手机号码"
                      />
                    </a-form-item>
                  </a-col>
                </a-row>
                
                <a-form-item>
                  <a-button
                    type="primary"
                    html-type="submit"
                    :loading="infoLoading"
                  >
                    保存信息
                  </a-button>
                </a-form-item>
              </a-form>
            </a-tab-pane>
            
            <a-tab-pane key="password" title="修改密码">
              <a-form
                ref="passwordFormRef"
                :model="passwordForm"
                :rules="passwordRules"
                layout="vertical"
                @submit="handlePasswordSubmit"
              >
                <a-form-item field="old_password" label="当前密码">
                  <a-input-password
                    v-model="passwordForm.old_password"
                    placeholder="请输入当前密码"
                  />
                </a-form-item>
                
                <a-form-item field="new_password" label="新密码">
                  <a-input-password
                    v-model="passwordForm.new_password"
                    placeholder="请输入新密码"
                  />
                </a-form-item>
                
                <a-form-item field="confirm_password" label="确认新密码">
                  <a-input-password
                    v-model="passwordForm.confirm_password"
                    placeholder="请再次输入新密码"
                  />
                </a-form-item>
                
                <a-form-item>
                  <a-button
                    type="primary"
                    html-type="submit"
                    :loading="passwordLoading"
                  >
                    修改密码
                  </a-button>
                </a-form-item>
              </a-form>
            </a-tab-pane>
          </a-tabs>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useMenuStore } from '@/stores/menu'
import { authApi } from '@/api/auth'
import { Message } from '@arco-design/web-vue'
import { API_CONFIG, getApiUrl, getAuthToken } from '@/api/config'
import {
  IconUser,
  IconCamera
} from '@arco-design/web-vue/es/icon'

export default {
  name: 'Profile',
  components: {
    IconUser,
    IconCamera
  },
  setup() {
    const menuStore = useMenuStore()
    
    const infoFormRef = ref(null)
    const passwordFormRef = ref(null)
    const infoLoading = ref(false)
    const passwordLoading = ref(false)
    
    // 获取认证token和上传配置
    const authToken = getAuthToken()
    const uploadHeaders = { Authorization: `Bearer ${authToken}` }
    const uploadUrl = getApiUrl(API_CONFIG.ENDPOINTS.UPLOAD)
    
    const userInfo = ref({
      id: null,
      username: '',
      nickname: '',
      email: '',
      phone: '',
      avatar: ''
    })
    
    const infoForm = reactive({
      nickname: '',
      email: '',
      phone: '',
      avatar: ''
    })
    
    const passwordForm = reactive({
      old_password: '',
      new_password: '',
      confirm_password: ''
    })
    
    const infoRules = {
      nickname: [{ required: true, message: '请输入昵称' }],
      email: [
        { type: 'email', message: '请输入正确的邮箱格式' }
      ],
      phone: [
        { match: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
      ]
    }
    
    const passwordRules = {
      old_password: [{ required: true, message: '请输入当前密码' }],
      new_password: [
        { required: true, message: '请输入新密码' },
        { minLength: 6, message: '密码长度不能少于6位' }
      ],
      confirm_password: [
        { required: true, message: '请确认新密码' },
        {
          validator: (value, cb) => {
            if (value !== passwordForm.new_password) {
              cb('两次输入的密码不一致')
            } else {
              cb()
            }
          }
        }
      ]
    }
    
    // 加载用户信息
    const loadUserInfo = async () => {
      try {
        const result = await authApi.getUserInfo()

        
        // 🎯 响应拦截器已经解包数据
        userInfo.value = result
        // 同步到编辑表单
        Object.assign(infoForm, {
          nickname: result.nickname || '',
          email: result.email || '',
          phone: result.phone || '',
          avatar: result.avatar || ''
        })
      } catch (error) {
        console.error('获取用户信息失败:', error)
        Message.error('获取用户信息失败')
      }
    }
    
    // 头像上传处理
    const handleAvatarChange = async (fileList) => {
      if (fileList.length > 0) {
        const file = fileList[0]

        
        if (file.status === 'done' && file.response) {
          // 🎯 上传组件收到的是完整响应格式，需要手动解包
          let actualData = file.response
          
          // 如果是标准API响应格式，解包data字段
          if (actualData && actualData.code === 200 && actualData.data) {
            actualData = actualData.data
          }
          
          if (actualData && actualData.url) {
            const avatarUrl = actualData.url
            
            try {
              // 更新头像
              const result = await authApi.updateProfile({ avatar: avatarUrl })
              
              // 🎯 响应拦截器已经解包数据
              userInfo.value.avatar = avatarUrl
              infoForm.avatar = avatarUrl
              Message.success('头像更新成功')
            } catch (error) {
              console.error('头像更新失败:', error)
              Message.error('头像更新失败')
            }
          } else {
            console.error('头像上传响应格式错误，期望包含url字段:', actualData)
            console.error('原始响应:', file.response)
            Message.error('头像上传失败：响应格式错误')
          }
        } else if (file.status === 'error') {
          console.error('头像上传失败，错误响应:', file.response)
          Message.error('头像上传失败，请重试')
        }
      }
    }
    
    // 提交基本信息
    const handleInfoSubmit = async () => {
      try {
        const errors = await infoFormRef.value.validate()
        if (!errors) {
          infoLoading.value = true
          
          const result = await authApi.updateProfile(infoForm)
          
          // 🎯 响应拦截器已经解包数据
          Object.assign(userInfo.value, result)
          Message.success('信息更新成功')
        }
      } catch (error) {
        console.error('信息更新失败:', error)
        Message.error('信息更新失败')
      } finally {
        infoLoading.value = false
      }
    }
    
    // 提交密码修改
    const handlePasswordSubmit = async () => {
      try {
        const errors = await passwordFormRef.value.validate()
        if (!errors) {
          passwordLoading.value = true
          
          const result = await authApi.changePassword(passwordForm)
          
          // 🎯 响应拦截器已经解包数据
          Message.success('密码修改成功')
          // 重置表单
          Object.assign(passwordForm, {
            old_password: '',
            new_password: '',
            confirm_password: ''
          })
        }
      } catch (error) {
        console.error('密码修改失败:', error)
        Message.error('密码修改失败')
      } finally {
        passwordLoading.value = false
      }
    }
    
    onMounted(() => {
      menuStore.generateBreadcrumbs('/profile')
      loadUserInfo()
    })
    
    return {
      infoFormRef,
      passwordFormRef,
      infoLoading,
      passwordLoading,
      uploadHeaders,
      uploadUrl,
      userInfo,
      infoForm,
      passwordForm,
      infoRules,
      passwordRules,
      handleAvatarChange,
      handleInfoSubmit,
      handlePasswordSubmit
    }
  }
}
</script>

<style scoped>
.profile-page {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d2129;
}

.page-header p {
  margin: 0;
  color: #86909c;
  font-size: 14px;
}

.profile-card,
.edit-card {
  border-radius: 8px;
}

.profile-info {
  text-align: center;
}

.avatar-section {
  margin-bottom: 24px;
}

.avatar-upload-area {
  width: 100px;
  height: 100px;
  border: 2px dashed #d9d9d9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  margin: 0 auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-upload-area:hover {
  border-color: #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

.avatar-upload-area.has-avatar {
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.avatar-upload-area.has-avatar:hover {
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}

.avatar-preview {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 500;
}

.avatar-upload-area:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay .arco-icon {
  font-size: 18px;
  margin-bottom: 4px;
}

.avatar-placeholder {
  text-align: center;
  color: #999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.avatar-placeholder > .arco-icon {
  font-size: 28px;
  margin-bottom: 6px;
  color: #c9cdd4;
}

.upload-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 10px;
  color: #86909c;
  font-weight: 500;
  margin-top: 4px;
}

.upload-text .arco-icon {
  font-size: 14px;
  margin-bottom: 3px;
}

.upload-text div {
  line-height: 1.2;
}

.info-section {
  text-align: left;
}

.info-item {
  display: flex;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item label {
  width: 80px;
  color: #86909c;
  font-weight: 500;
}

.info-item span {
  flex: 1;
  color: #1d2129;
}
</style> 