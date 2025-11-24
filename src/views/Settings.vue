<template>
  <div class="settings-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">系统设置</h1>
      <p class="page-description">管理系统配置和存储设置（仅管理员可访问）</p>
    </div>

    <!-- 设置选项卡 -->
    <t-tabs v-model="activeTab" placement="top" size="large" class="settings-tabs">
      
      <!-- 对象存储配置 -->
      <t-tab-panel value="storage" label="对象存储">
        <div class="settings-section">
          <div class="section-header">
            <h3 class="section-title">
              <CloudIcon class="section-icon" />
              对象存储配置
            </h3>
            <p class="section-desc">配置多个对象存储服务，支持腾讯云COS、阿里云OSS等</p>
          </div>

          <!-- 存储列表 -->
          <div class="storage-list">
            <div 
              v-for="(storage, index) in storageList" 
              :key="storage.id"
              class="storage-card"
              :class="{ 'active': storage.isDefault === true }"
            >
              <div class="storage-header">
                <div class="storage-info">
                  <h4 class="storage-name">{{ storage.name }}</h4>
                  <span class="storage-type">{{ getStorageTypeLabel(storage.type) }}</span>
                  <t-tag v-if="storage.isDefault === true" theme="success" size="small">默认</t-tag>
                </div>
                <div class="storage-actions">
                  <t-button 
                    v-if="storage.isDefault !== true"
                    theme="primary" 
                    variant="outline" 
                    size="small"
                    @click="setDefaultStorage(storage.id)"
                    :loading="settingDefault === storage.id"
                  >
                    设为默认
                  </t-button>
                  <t-button 
                    theme="default" 
                    variant="text" 
                    size="small"
                    @click="editStorage(storage)"
                  >
                    编辑
                  </t-button>
                  <t-button 
                    theme="danger" 
                    variant="text" 
                    size="small"
                    @click="deleteStorage(storage.id)"
                  >
                    删除
                  </t-button>
                </div>
              </div>
              <div class="storage-details">
                <div class="storage-status">
                  <span class="status-dot" :class="storage.status"></span>
                  {{ getStatusText(storage.status) }}
                </div>
                <div class="storage-url">{{ storage.customDomain || '未配置自定义域名' }}</div>
              </div>
            </div>
          </div>

          <!-- 添加存储按钮 -->
          <div class="add-storage-section">
            <t-button theme="primary" @click="showAddStorageDialog">
              <template #icon><PlusIcon /></template>
              添加对象存储
            </t-button>
          </div>
        </div>
      </t-tab-panel>

      <!-- 系统配置 -->
      <t-tab-panel value="system" label="系统配置">
        <div class="settings-section">
          <div class="section-header">
            <h3 class="section-title">
              <SettingsIcon class="section-icon" />
              系统基础配置
            </h3>
            <p class="section-desc">配置系统的基本参数和上传限制</p>
          </div>



          <t-form 
            ref="systemForm" 
            :data="systemConfig" 
            layout="vertical"
            :colon="false"
            class="settings-form"
          >
            <!-- 品牌设置 -->
            <div class="form-section">
              <h4 class="form-section-title">品牌设置</h4>
              <t-form-item label="网站名称" name="siteName">
                <t-input 
                  v-model="systemConfig.siteName" 
                  placeholder="图床管理系统"
                />
              </t-form-item>
              
              <t-form-item label="网站描述" name="siteDescription">
                <t-input 
                  v-model="systemConfig.siteDescription" 
                  placeholder="专业的图片存储和管理平台"
                />
              </t-form-item>
              
              <t-form-item label="网站图标" name="siteIcon">
                <t-input 
                  v-model="systemConfig.siteIcon" 
                  placeholder="https://example.com/favicon.ico"
                />
                <template #help>
                  网站图标URL，显示在浏览器标签页
                </template>
              </t-form-item>
              
              <t-form-item label="网站Logo" name="siteLogo">
                <t-input 
                  v-model="systemConfig.siteLogo" 
                  placeholder="https://example.com/logo.png"
                />
                <template #help>
                  网站Logo URL，显示在导航栏
                </template>
              </t-form-item>
            </div>

            <!-- 上传设置 -->
            <div class="form-section">
              <h4 class="form-section-title">上传设置</h4>
              <t-form-item label="最大文件大小" name="maxFileSize">
                <t-input-number 
                  v-model="systemConfig.maxFileSize" 
                  :min="1" 
                  :max="100"
                  placeholder="10"
                />
                <template #help>
                  单位：MB
                </template>
              </t-form-item>
              
              <t-form-item label="批量上传数量" name="maxBatchCount">
                <t-input-number 
                  v-model="systemConfig.maxBatchCount" 
                  :min="1" 
                  :max="50"
                  placeholder="20"
                />
                <template #help>
                  单次最多上传文件数
                </template>
              </t-form-item>
              
              <t-form-item label="允许的文件类型" name="allowedTypes">
                <t-select 
                  v-model="systemConfig.allowedTypes" 
                  multiple
                  placeholder="选择允许的文件类型"
                  :options="fileTypeOptions"
                />
              </t-form-item>

              <t-form-item label="自动压缩图片" name="autoCompress">
                <t-switch v-model="systemConfig.autoCompress" />
                <template #help>
                  上传时自动压缩图片
                </template>
              </t-form-item>
              
              <t-form-item v-if="systemConfig.autoCompress" label="压缩质量" name="compressQuality">
                <t-slider 
                  v-model="systemConfig.compressQuality" 
                  :min="10" 
                  :max="100"
                  :step="5"
                  :marks="{ 50: '50%', 80: '80%' }"
                />
              </t-form-item>
            </div>

            <!-- 用户管理设置 -->
            <div class="form-section">
              <h4 class="form-section-title">用户管理</h4>
              <t-form-item label="允许用户注册" name="allowRegistration">
                <t-switch v-model="systemConfig.allowRegistration" />
                <template #help>
                  关闭后，新用户将无法注册账户
                </template>
              </t-form-item>
            </div>

            <div class="form-actions">
              <t-button theme="primary" @click="saveSystemConfig" :loading="isSaving">
                保存系统配置
              </t-button>
            </div>
          </t-form>
        </div>
      </t-tab-panel>

      <!-- 邮件配置 -->
      <t-tab-panel value="email" label="邮件服务">
        <div class="settings-section">
          <div class="section-header">
            <h3 class="section-title">
              <MailIcon class="section-icon" />
              邮件服务配置
            </h3>
            <p class="section-desc">配置SMTP邮件服务，用于发送通知和验证邮件</p>
          </div>

          <t-form 
            ref="emailForm" 
            :data="emailConfig" 
            layout="vertical"
            :colon="false"
            class="settings-form"
          >
            <t-form-item label="SMTP服务器" name="smtpHost">
              <t-input 
                v-model="emailConfig.smtpHost" 
                placeholder="smtp.example.com"
              />
            </t-form-item>
            
            <t-form-item label="SMTP端口" name="smtpPort">
              <t-input-number 
                v-model="emailConfig.smtpPort" 
                :min="1" 
                :max="65535"
                placeholder="587"
              />
            </t-form-item>

            <t-form-item label="SSL/TLS加密" name="smtpSecure">
              <t-switch 
                v-model="emailConfig.smtpSecure"
              />
              <template #help>
                端口465通常使用SSL，端口587通常使用TLS
              </template>
            </t-form-item>
            
            <t-form-item label="测试邮箱" name="testEmail">
              <t-input 
                v-model="emailConfig.testEmail" 
                placeholder="test@example.com"
              />
              <template #help>
                用于接收测试邮件的邮箱地址
              </template>
            </t-form-item>

            <t-form-item label="发件人邮箱" name="fromEmail">
              <t-input 
                v-model="emailConfig.fromEmail" 
                placeholder="noreply@example.com"
              />
            </t-form-item>
            
            <t-form-item label="发件人名称" name="fromName">
              <t-input 
                v-model="emailConfig.fromName" 
                placeholder="图床系统"
              />
            </t-form-item>

            <t-form-item label="SMTP用户名" name="smtpUser">
              <t-input 
                v-model="emailConfig.smtpUser" 
                placeholder="用户名或邮箱"
              />
            </t-form-item>
            
            <t-form-item label="SMTP密码" name="smtpPass">
              <t-input 
                v-model="emailConfig.smtpPass" 
                type="password"
                placeholder="密码或授权码"
              />
            </t-form-item>

            <div class="form-actions">
              <t-button variant="outline" @click="testEmail" :loading="isTesting">
                <template #icon><TestTubeIcon /></template>
                测试邮件发送
              </t-button>
              <t-button theme="primary" @click="saveEmailConfig" :loading="isSaving">
                保存邮件配置
              </t-button>
            </div>
          </t-form>
        </div>
      </t-tab-panel>

      <!-- 安全配置 -->
      <t-tab-panel value="security" label="安全设置">
        <div class="settings-section">
          <div class="section-header">
            <h3 class="section-title">
              <ShieldIcon class="section-icon" />
              安全配置
            </h3>
            <p class="section-desc">配置系统安全相关设置</p>
          </div>

          <t-form 
            ref="securityForm" 
            :data="securityConfig" 
            layout="vertical"
            :colon="false"
            class="settings-form"
          >
            <t-form-item label="邮箱验证" name="requireEmailVerification">
              <t-switch v-model="securityConfig.requireEmailVerification" />
              <template #help>
                开启后，新用户注册需要验证邮箱才能使用
              </template>
            </t-form-item>

            <t-form-item label="JWT过期时间" name="jwtExpiration">
              <t-input-number 
                v-model="securityConfig.jwtExpiration" 
                :min="1" 
                :max="720"
                placeholder="24"
              />
              <template #help>
                单位：小时
              </template>
            </t-form-item>
            
            <t-form-item label="最大登录尝试" name="maxLoginAttempts">
              <t-input-number 
                v-model="securityConfig.maxLoginAttempts" 
                :min="3" 
                :max="20"
                placeholder="5"
              />
              <template #help>
                超过次数将被锁定
              </template>
            </t-form-item>

            <div class="form-actions">
              <t-button theme="primary" @click="saveSecurityConfig" :loading="isSaving">
                保存安全配置
              </t-button>
            </div>
          </t-form>
        </div>
      </t-tab-panel>

      <!-- 数据库管理 -->
      <t-tab-panel value="database" label="数据库管理">
        <div class="settings-section">
          <div class="section-header">
            <h3 class="section-title">
              <DatabaseIcon class="section-icon" />
              数据库管理
            </h3>
            <p class="section-desc">管理数据库备份和迁移</p>
          </div>

          <!-- 数据库信息 -->
          <div class="info-card">
            <h4 class="info-card-title">数据库信息</h4>
            <div class="info-row">
              <span class="info-label">数据库类型：</span>
              <t-tag :theme="dbInfo.type === 'sqlite' ? 'success' : 'primary'">
                {{ dbInfo.type === 'sqlite' ? 'SQLite' : 'PostgreSQL' }}
              </t-tag>
            </div>
            <div v-if="dbInfo.path" class="info-row">
              <span class="info-label">数据库路径：</span>
              <span class="info-value">{{ dbInfo.path }}</span>
            </div>
            <div v-if="dbInfo.size" class="info-row">
              <span class="info-label">数据库大小：</span>
              <span class="info-value">{{ formatFileSize(dbInfo.size) }}</span>
            </div>
          </div>

          <!-- 数据库备份（仅SQLite） -->
          <div v-if="dbInfo.type === 'sqlite'" class="form-section">
            <h4 class="form-section-title">数据库备份</h4>
            <p class="section-desc">创建数据库备份以防止数据丢失</p>
            
            <div class="form-actions">
              <t-button theme="primary" @click="createBackup" :loading="isBackingUp">
                <template #icon><DownloadCloudIcon /></template>
                创建备份
              </t-button>
              <t-button variant="outline" @click="loadBackups">
                <template #icon><RefreshCwIcon /></template>
                刷新列表
              </t-button>
            </div>

            <!-- 备份列表 -->
            <div v-if="backups.length > 0" class="backup-list">
              <h5 class="backup-list-title">备份文件列表</h5>
              <div v-for="backup in backups" :key="backup.fileName" class="backup-item">
                <div class="backup-info">
                  <div class="backup-name">{{ backup.fileName }}</div>
                  <div class="backup-meta">
                    <span>{{ formatFileSize(backup.fileSize) }}</span>
                    <span>{{ formatDate(backup.createdAt) }}</span>
                  </div>
                </div>
                <div class="backup-actions">
                  <t-button 
                    size="small" 
                    variant="outline" 
                    @click="downloadBackupFile(backup.fileName)"
                  >
                    下载
                  </t-button>
                  <t-button 
                    size="small" 
                    theme="danger" 
                    variant="text"
                    @click="deleteBackupFile(backup.fileName)"
                  >
                    删除
                  </t-button>
                </div>
              </div>
            </div>
          </div>

          <!-- PostgreSQL 转 SQLite -->
          <div class="form-section">
            <h4 class="form-section-title">数据库迁移</h4>
            <p class="section-desc">将 PostgreSQL 数据库转换为 SQLite 格式</p>

            <t-form layout="vertical" :colon="false" class="migrate-form">
              <t-form-item label="PostgreSQL 连接字符串" name="databaseUrl">
                <t-textarea 
                  v-model="migrationConfig.databaseUrl" 
                  placeholder="postgresql://username:password@host:port/database"
                  :rows="3"
                />
                <template #help>
                  例如：postgresql://user:pass@localhost:5432/imagedb
                </template>
              </t-form-item>

              <div class="form-actions">
                <t-button 
                  theme="warning" 
                  @click="startMigration" 
                  :loading="isMigrating"
                  :disabled="!migrationConfig.databaseUrl"
                >
                  <template #icon><DatabaseIcon /></template>
                  开始转换
                </t-button>
              </div>

              <!-- 转换结果 -->
              <div v-if="migrationResult" class="migration-result">
                <t-alert :theme="migrationResult.success ? 'success' : 'error'" :message="migrationResult.message">
                  <template v-if="migrationResult.success && migrationResult.data" #default>
                    <div class="migration-details">
                      <p><strong>转换完成！</strong></p>
                      <p>文件名：{{ migrationResult.data.fileName }}</p>
                      <p>文件大小：{{ formatFileSize(migrationResult.data.fileSize) }}</p>
                      <p>已复制记录：</p>
                      <ul>
                        <li>用户：{{ migrationResult.data.recordsCopied.users }} 条</li>
                        <li>图片：{{ migrationResult.data.recordsCopied.images }} 条</li>
                        <li>存储配置：{{ migrationResult.data.recordsCopied.storages }} 条</li>
                        <li>统计数据：{{ migrationResult.data.recordsCopied.stats }} 条</li>
                        <li>系统配置：{{ migrationResult.data.recordsCopied.configs }} 条</li>
                      </ul>
                      <t-button 
                        theme="primary" 
                        @click="downloadMigrationFile(migrationResult.data.fileName)"
                      >
                        下载 SQLite 数据库文件
                      </t-button>
                    </div>
                  </template>
                </t-alert>
              </div>
            </t-form>
          </div>

          <!-- 警告提示 -->
          <t-alert theme="warning" title="重要提示">
            <ul>
              <li>数据库备份和迁移操作可能需要较长时间，请耐心等待</li>
              <li>建议在低峰期进行数据库操作</li>
              <li>迁移后请妥善保管数据库文件</li>
              <li>使用 SQLite 模式时，定期备份数据库文件</li>
            </ul>
          </t-alert>
        </div>
      </t-tab-panel>
    </t-tabs>

    

    <!-- 添加/编辑存储对话框 -->
    <t-dialog 
      v-model:visible="storageDialogVisible" 
      :title="isEditingStorage ? '编辑对象存储' : '添加对象存储'"
      width="70%"
      :on-confirm="saveStorageConfig"
      :confirm-btn="{ loading: isSaving }"
    >
      <t-form 
        ref="storageForm" 
        :data="currentStorage" 
        :rules="storageRules"
        layout="vertical"
        :colon="false"
      >
        <t-form-item label="存储名称" name="name">
          <t-input 
            v-model="currentStorage.name" 
            placeholder="例如：腾讯云COS-主存储"
          />
        </t-form-item>

        <t-form-item label="存储类型" name="type">
          <t-select 
            v-model="currentStorage.type" 
            placeholder="选择存储类型"
            :options="storageTypeOptions"
            @change="onStorageTypeChange"
          />
        </t-form-item>

        <!-- 腾讯云COS配置 -->
        <template v-if="currentStorage.type === 'cos'">
          <t-form-item label="SecretId" name="secretId">
            <t-input 
              v-model="currentStorage.secretId" 
              placeholder="腾讯云SecretId"
            />
          </t-form-item>
          
          <t-form-item label="SecretKey" name="secretKey">
            <t-input 
              v-model="currentStorage.secretKey" 
              type="password"
              placeholder="腾讯云SecretKey"
            />
          </t-form-item>
          
          <t-form-item label="存储桶名称" name="bucket">
            <t-input 
              v-model="currentStorage.bucket" 
              placeholder="bucket-name"
            />
          </t-form-item>
          
          <t-form-item label="访问端点" name="endpoint">
            <t-input 
              v-model="currentStorage.endpoint" 
              placeholder="https://cos.ap-beijing.myqcloud.com"
            />
            <template #help>
              腾讯云COS的访问端点
            </template>
          </t-form-item>
        </template>

        <!-- 阿里云OSS配置 -->
        <template v-if="currentStorage.type === 'oss'">
              <t-form-item label="AccessKey ID" name="accessKeyId">
                <t-input 
                  v-model="currentStorage.accessKeyId" 
                  placeholder="阿里云AccessKey ID"
                />
              </t-form-item>

          
              <t-form-item label="AccessKey Secret" name="accessKeySecret">
                <t-input 
                  v-model="currentStorage.accessKeySecret" 
                  type="password"
                  placeholder="阿里云AccessKey Secret"
                />
              </t-form-item>

          
              <t-form-item label="存储桶名称" name="bucket">
                <t-input 
                  v-model="currentStorage.bucket" 
                  placeholder="bucket-name"
                />
              </t-form-item>

          
              <t-form-item label="访问端点" name="endpoint">
                <t-input 
                  v-model="currentStorage.endpoint" 
                  placeholder="https://oss-cn-hangzhou.aliyuncs.com"
                />
                <template #help>
                  阿里云OSS的访问端点
                </template>
              </t-form-item>

          
        </template>

        <!-- 七牛云KODO配置 -->
        <template v-if="currentStorage.type === 'qiniu'">
              <t-form-item label="AccessKey" name="accessKey">
                <t-input 
                  v-model="currentStorage.accessKey" 
                  placeholder="七牛云AccessKey"
                />
              </t-form-item>

          
              <t-form-item label="SecretKey" name="secretKey">
                <t-input 
                  v-model="currentStorage.secretKey" 
                  type="password"
                  placeholder="七牛云SecretKey"
                />
              </t-form-item>

          
              <t-form-item label="存储桶名称" name="bucket">
                <t-input 
                  v-model="currentStorage.bucket" 
                  placeholder="bucket-name"
                />
              </t-form-item>

          
              <t-form-item label="访问端点" name="endpoint">
                <t-input 
                  v-model="currentStorage.endpoint" 
                  placeholder="https://s3-cn-east-1.qiniucs.com"
                />
                <template #help>
                  七牛云KODO的访问端点
                </template>
              </t-form-item>

          
        </template>

        <!-- 又拍云USS配置 -->
        <template v-if="currentStorage.type === 'upyun'">
              <t-form-item label="操作员账号" name="operator">
                <t-input 
                  v-model="currentStorage.operator" 
                  placeholder="又拍云操作员账号"
                />
              </t-form-item>

          
              <t-form-item label="操作员密码" name="password">
                <t-input 
                  v-model="currentStorage.password" 
                  type="password"
                  placeholder="又拍云操作员密码"
                />
              </t-form-item>

          
              <t-form-item label="服务名称" name="bucket">
                <t-input 
                  v-model="currentStorage.bucket" 
                  placeholder="service-name"
                />
              </t-form-item>

          
              <t-form-item label="访问端点" name="endpoint">
                <t-input 
                  v-model="currentStorage.endpoint" 
                  placeholder="https://v0.api.upyun.com"
                />
                <template #help>
                  又拍云USS的访问端点
                </template>
              </t-form-item>

          
        </template>

        <!-- Amazon S3配置 -->
        <template v-if="currentStorage.type === 's3'">
              <t-form-item label="Access Key ID" name="accessKeyId">
                <t-input 
                  v-model="currentStorage.accessKeyId" 
                  placeholder="AWS Access Key ID"
                />
              </t-form-item>

          
              <t-form-item label="Secret Access Key" name="secretAccessKey">
                <t-input 
                  v-model="currentStorage.secretAccessKey" 
                  type="password"
                  placeholder="AWS Secret Access Key"
                />
              </t-form-item>

          
              <t-form-item label="存储桶名称" name="bucket">
                <t-input 
                  v-model="currentStorage.bucket" 
                  placeholder="bucket-name"
                />
              </t-form-item>

          
              <t-form-item label="区域" name="region">
                <t-input 
                  v-model="currentStorage.region" 
                  placeholder="us-east-1"
                />
                <template #help>
                  AWS区域，例如：us-east-1
                </template>
              </t-form-item>

          
          <t-form-item label="自定义端点" name="endpoint">
            <t-input 
              v-model="currentStorage.endpoint" 
              placeholder="https://s3.amazonaws.com（可选）"
            />
            <template #help>
              自定义S3端点，留空使用AWS默认端点
            </template>
          </t-form-item>
        </template>

        <!-- MinIO配置 -->
        <template v-if="currentStorage.type === 'minio'">
              <t-form-item label="Access Key" name="accessKey">
                <t-input 
                  v-model="currentStorage.accessKey" 
                  placeholder="MinIO Access Key"
                />
              </t-form-item>

          
              <t-form-item label="Secret Key" name="secretKey">
                <t-input 
                  v-model="currentStorage.secretKey" 
                  type="password"
                  placeholder="MinIO Secret Key"
                />
              </t-form-item>

          
              <t-form-item label="存储桶名称" name="bucket">
                <t-input 
                  v-model="currentStorage.bucket" 
                  placeholder="bucket-name"
                />
              </t-form-item>

          
              <t-form-item label="服务器地址" name="endpoint">
                <t-input 
                  v-model="currentStorage.endpoint" 
                  placeholder="https://minio.example.com"
                />
                <template #help>
                  MinIO服务器地址
                </template>
              </t-form-item>

          
              <t-form-item label="使用SSL连接" name="useSSL">
                <t-switch v-model="currentStorage.useSSL" />
                <template #help>
                  是否使用HTTPS连接MinIO服务器
                </template>
              </t-form-item>

          
        </template>

        <!-- 自定义域名 -->
        <t-form-item label="自定义访问域名" name="customDomain">
          <t-input 
            v-model="currentStorage.customDomain" 
            placeholder="https://your-domain.com"
          />
          <template #help>
            留空将使用默认域名，建议配置自定义域名以获得更好的访问速度
          </template>
        </t-form-item>

        <!-- 路径前缀 -->
        <t-form-item label="存储路径前缀" name="pathPrefix">
          <t-input 
            v-model="currentStorage.pathPrefix" 
            placeholder="images/"
          />
          <template #help>
            可选，用于在存储桶中创建文件夹结构
          </template>
        </t-form-item>
      </t-form>

      <template #footer>
        <t-button variant="outline" @click="testStorageConnection" :loading="isTesting">
          测试连接
        </t-button>
        <t-button theme="primary" @click="saveStorageConfig" :loading="isSaving">
          {{ isEditingStorage ? '更新' : '添加' }}
        </t-button>
      </template>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { 
  CloudIcon,
  SettingsIcon,
  MailIcon,
  ShieldIcon,
  PlusIcon,
  TestTubeIcon,
  DatabaseIcon,
  DownloadCloudIcon,
  RefreshCwIcon
} from 'lucide-vue-next'
import { MessagePlugin } from 'tdesign-vue-next'
import { apiService } from '@/services/api'

// 响应式数据
const activeTab = ref('storage')
const isSaving = ref(false)
const isTesting = ref(false)
const storageDialogVisible = ref(false)
const isEditingStorage = ref(false)
const settingDefault = ref<string | null>(null)

// 存储列表
const storageList = ref<any[]>([])

// 当前编辑的存储配置
const currentStorage = ref({
  id: '',
  name: '',
  type: '',
  secretId: '',
  secretKey: '',
  accessKey: '',
  accessKeyId: '',
  accessKeySecret: '',
  secretAccessKey: '',
  operator: '',
  password: '',
  bucket: '',
  region: '',
  endpoint: '',
  useSSL: true,
  customDomain: '',
  pathPrefix: ''
})

// 系统配置
const systemConfig = reactive({
  // 品牌设置
  siteName: 'CDNN图床',
  siteIcon: '',
  siteLogo: '',
  siteDescription: '专业的图片存储和管理平台',
  
  // 上传设置
  maxFileSize: 10,
  maxBatchCount: 20,
  allowedTypes: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
  autoCompress: true,
  compressQuality: 80,
  generateThumbnail: true,
  
  // 用户管理设置
  allowRegistration: true
})

// 邮件配置
const emailConfig = reactive({
  smtpHost: '',
  smtpPort: 587,
  smtpSecure: false,
  fromEmail: '',
  fromName: '图床系统',
  smtpUser: '',
  smtpPass: '',
  testEmail: ''
})

// 安全配置
const securityConfig = reactive({
  requireEmailVerification: false,
  jwtExpiration: 24,
  maxLoginAttempts: 5
})

// 数据库管理相关
const dbInfo = reactive({
  type: 'sqlite',
  path: null as string | null,
  size: null as number | null
})

const backups = ref<any[]>([])
const isBackingUp = ref(false)
const isMigrating = ref(false)

const migrationConfig = reactive({
  databaseUrl: ''
})

const migrationResult = ref<any>(null)

// 表单验证规则
const storageRules = {
  name: [{ required: true, message: '请输入存储名称' }],
  type: [{ required: true, message: '请选择存储类型' }]
}

// 选项数据
const storageTypeOptions = [
  { label: '腾讯云COS', value: 'cos' },
  { label: '阿里云OSS', value: 'oss' },
  { label: '七牛云KODO', value: 'qiniu' },
  { label: '又拍云USS', value: 'upyun' },
  { label: 'Amazon S3', value: 's3' },
  { label: 'MinIO', value: 'minio' }
]

const fileTypeOptions = [
  { label: 'JPEG', value: 'jpeg' },
  { label: 'JPG', value: 'jpg' },
  { label: 'PNG', value: 'png' },
  { label: 'GIF', value: 'gif' },
  { label: 'WebP', value: 'webp' },
  { label: 'BMP', value: 'bmp' },
  { label: 'SVG', value: 'svg' }
]


// 方法
const getStorageTypeLabel = (type: string) => {
  const option = storageTypeOptions.find(opt => opt.value === type)
  return option?.label || type
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'connected': '连接正常',
    'error': '连接错误',
    'testing': '测试中...'
  }
  return statusMap[status] || '未知状态'
}

const showAddStorageDialog = () => {
  isEditingStorage.value = false
  currentStorage.value = {
    id: '',
    name: '',
    type: '',
    secretId: '',
    secretKey: '',
    accessKey: '',
    accessKeyId: '',
    accessKeySecret: '',
    secretAccessKey: '',
    operator: '',
    password: '',
    bucket: '',
    region: '',
    endpoint: '',
    useSSL: true,
    customDomain: '',
    pathPrefix: ''
  }
  storageDialogVisible.value = true
}

const editStorage = (storage: any) => {
  isEditingStorage.value = true
  currentStorage.value = { ...storage }
  storageDialogVisible.value = true
}

const onStorageTypeChange = () => {
  // 清空相关字段
  currentStorage.value.secretId = ''
  currentStorage.value.secretKey = ''
  currentStorage.value.accessKey = ''
  currentStorage.value.accessKeyId = ''
  currentStorage.value.accessKeySecret = ''
  currentStorage.value.secretAccessKey = ''
  currentStorage.value.operator = ''
  currentStorage.value.password = ''
  currentStorage.value.bucket = ''
  currentStorage.value.region = ''
  currentStorage.value.endpoint = ''
  currentStorage.value.useSSL = true
}

const testStorageConnection = async () => {
  isTesting.value = true
  try {
    const response = await apiService.testStorageConnection(
      currentStorage.value.type,
      currentStorage.value
    )
    if (response.success) {
      MessagePlugin.success('存储连接测试成功')
    } else {
      MessagePlugin.error('连接测试失败: ' + response.message)
    }
  } catch (error: any) {

    MessagePlugin.error('连接测试失败: ' + error.message)
  } finally {
    isTesting.value = false
  }
}

const saveStorageConfig = async () => {
  isSaving.value = true
  try {
    const { id, name, type, ...config } = currentStorage.value
    
    if (isEditingStorage.value && id) {
      // 更新存储配置
      await apiService.updateStorage(id, name, type, config)
      MessagePlugin.success('存储配置更新成功')
    } else {
      // 创建存储配置
      await apiService.createStorage(name, type, config)
      MessagePlugin.success('存储配置创建成功')
    }
    
    storageDialogVisible.value = false
    loadStorageList()
  } catch (error: any) {

    MessagePlugin.error('保存失败: ' + error.message)
  } finally {
    isSaving.value = false
  }
}

// 设置默认存储
const setDefaultStorage = async (storageId: string) => {
  settingDefault.value = storageId
  try {
    const response = await apiService.setDefaultStorage(parseInt(storageId))
    if (response.success) {
      MessagePlugin.success('默认存储设置成功')
      loadStorageList()
    } else {
      MessagePlugin.error('设置失败: ' + response.message)
    }
  } catch (error: any) {

    MessagePlugin.error('设置失败: ' + error.message)
  } finally {
    settingDefault.value = null
  }
}

const deleteStorage = async (storageId: string) => {
  try {
    await apiService.deleteStorage(storageId)
    MessagePlugin.success('存储配置删除成功')
    loadStorageList()
  } catch (error: any) {

    MessagePlugin.error('删除失败: ' + error.message)
  }
}

const saveSystemConfig = async () => {
  isSaving.value = true
  try {
    const response = await apiService.setConfigItem('system', systemConfig, '系统基础配置')
    if (response.success) {
      MessagePlugin.success('系统配置保存成功')
    } else {
      MessagePlugin.error('保存失败: ' + response.message)
    }
  } catch (error: any) {

    MessagePlugin.error('保存失败: ' + error.message)
  } finally {
    isSaving.value = false
  }
}

const testEmail = async () => {
  isTesting.value = true
  try {
    const response = await apiService.testEmailConnection(emailConfig)
    if (response.success) {
      MessagePlugin.success('测试邮件发送成功')
    } else {
      MessagePlugin.error('发送失败: ' + response.message)
    }
  } catch (error: any) {
    MessagePlugin.error('发送失败: ' + error.message)
  } finally {
    isTesting.value = false
  }
}

const saveEmailConfig = async () => {
  isSaving.value = true
  try {
    const response = await apiService.setConfigItem('email', emailConfig, '邮件服务配置')
    if (response.success) {
      MessagePlugin.success('邮件配置保存成功')
    } else {
      MessagePlugin.error('保存失败: ' + response.message)
    }
  } catch (error: any) {

    MessagePlugin.error('保存失败: ' + error.message)
  } finally {
    isSaving.value = false
  }
}

const saveSecurityConfig = async () => {
  isSaving.value = true
  try {
    const response = await apiService.setConfigItem('security', securityConfig, '系统安全配置')
    if (response.success) {
      MessagePlugin.success('安全配置保存成功')
    } else {
      MessagePlugin.error('保存失败: ' + response.message)
    }
  } catch (error: any) {
    MessagePlugin.error('保存失败: ' + error.message)
  } finally {
    isSaving.value = false
  }
}

const loadStorageList = async () => {
  try {
    const response = await apiService.getAllStorages()
    if (response.success && response.data) {

      storageList.value = response.data.map(storage => {
        // 强制转换为布尔值，处理各种可能的数据类型
        const isDefaultValue = storage.is_default === true || storage.is_default === 'true' || storage.is_default === 1
        
        const mapped = {
          id: storage.id.toString(),
          name: storage.name,
          type: storage.type,
          isDefault: isDefaultValue,
          status: 'connected', // TODO: 实现真实的连接状态检测
          customDomain: storage.config.customDomain || '',
          ...storage.config
        }
        
        console.log(`存储 ${storage.name}: 原始值=${storage.is_default} (类型: ${typeof storage.is_default}), 转换后=${mapped.isDefault}`)
        return mapped
      })

    }
  } catch (error) {

    MessagePlugin.error('加载存储配置失败')
  }
}

const loadConfigs = async () => {
  try {
    const response = await apiService.getConfig()
    if (response.success && response.data) {
      // 加载系统配置
      if (response.data.system) {
        Object.assign(systemConfig, response.data.system)
      }
      // 加载安全配置
      if (response.data.security) {
        Object.assign(securityConfig, response.data.security)
      }
      // 加载邮件配置
      if (response.data.email) {
        Object.assign(emailConfig, response.data.email)
      }
    }
  } catch (error) {
    MessagePlugin.error('加载配置失败')
  }
}

// 数据库管理方法
const loadDatabaseInfo = async () => {
  try {
    const response = await apiService.getDatabaseInfo()
    if (response.success && response.data) {
      Object.assign(dbInfo, response.data)
    }
  } catch (error) {
    console.error('加载数据库信息失败:', error)
  }
}

const loadBackups = async () => {
  try {
    const response = await apiService.getDatabaseBackups()
    if (response.success && response.data) {
      backups.value = response.data
    }
  } catch (error) {
    MessagePlugin.error('加载备份列表失败')
  }
}

const createBackup = async () => {
  isBackingUp.value = true
  try {
    const response = await apiService.backupDatabase()
    if (response.success) {
      MessagePlugin.success('数据库备份成功')
      await loadBackups()
      
      // 自动下载
      if (response.data?.fileName) {
        await downloadBackupFile(response.data.fileName)
      }
    } else {
      MessagePlugin.error(response.message || '备份失败')
    }
  } catch (error: any) {
    MessagePlugin.error('备份失败: ' + error.message)
  } finally {
    isBackingUp.value = false
  }
}

const downloadBackupFile = async (fileName: string) => {
  try {
    const blob = await apiService.downloadBackup(fileName)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    MessagePlugin.success('下载成功')
  } catch (error: any) {
    MessagePlugin.error('下载失败: ' + error.message)
  }
}

const deleteBackupFile = async (fileName: string) => {
  try {
    const response = await apiService.deleteBackup(fileName)
    if (response.success) {
      MessagePlugin.success('删除成功')
      await loadBackups()
    }
  } catch (error: any) {
    MessagePlugin.error('删除失败: ' + error.message)
  }
}

const startMigration = async () => {
  if (!migrationConfig.databaseUrl) {
    MessagePlugin.warning('请输入 PostgreSQL 连接字符串')
    return
  }

  isMigrating.value = true
  migrationResult.value = null

  try {
    const response = await apiService.migratePostgresToSqlite(migrationConfig.databaseUrl)
    migrationResult.value = response
    
    if (response.success) {
      MessagePlugin.success('数据库转换成功')
    } else {
      MessagePlugin.error(response.message || '转换失败')
    }
  } catch (error: any) {
    migrationResult.value = {
      success: false,
      message: '转换失败: ' + error.message
    }
    MessagePlugin.error('转换失败: ' + error.message)
  } finally {
    isMigrating.value = false
  }
}

const downloadMigrationFile = async (fileName: string) => {
  try {
    const blob = await apiService.downloadMigratedDatabase(fileName)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    MessagePlugin.success('下载成功')
  } catch (error: any) {
    MessagePlugin.error('下载失败: ' + error.message)
  }
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadConfigs()
  loadStorageList()
  loadDatabaseInfo()
  loadBackups()
})
</script>

<style scoped>
.settings-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

.page-header {
  margin-top: 30px;
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  margin: 0;
}

.settings-tabs {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.settings-section {
  padding: 32px;
}

.section-header {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 0 0 8px 0;
}

.section-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  color: var(--td-brand-color);
}

.section-desc {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  margin: 0;
}

/* 存储列表样式 */
.storage-list {
  margin-bottom: 24px;
}

.storage-card {
  border: 1px solid var(--td-border-level-1-color);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.2s;
}

.storage-card:hover {
  border-color: var(--td-brand-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.storage-card.active {
  border-color: var(--td-brand-color);
  background: var(--td-brand-color-light);
}

.storage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.storage-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.storage-name {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
}

.storage-type {
  font-size: 12px;
  color: var(--td-text-color-secondary);
  background: var(--td-bg-color-container);
  padding: 2px 8px;
  border-radius: 4px;
}

.storage-actions {
  display: flex;
  gap: 8px;
}

.storage-details {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: var(--td-text-color-secondary);
}

.storage-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.connected {
  background: var(--td-success-color);
}

.status-dot.error {
  background: var(--td-error-color);
}

.status-dot.testing {
  background: var(--td-warning-color);
}

.add-storage-section {
  border: 2px dashed var(--td-border-level-1-color);
  border-radius: 8px;
  padding: 32px;
  text-align: center;
}

/* 表单样式 - 只保留非组件相关的样式 */
.settings-form {
  max-width: 100%;
}

.form-section {
  margin-bottom: 40px;
  padding-bottom: 32px;
  
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.form-section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 0 0 24px 0;
  padding-left: 12px;
  border-left: 4px solid var(--td-brand-color);
  line-height: 1.5;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--td-border-level-1-color);
}

/* 数据库管理样式 */
.info-card {
  background: var(--td-bg-color-container);
  border: 1px solid var(--td-border-level-1-color);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.info-card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 0 0 16px 0;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 500;
  color: var(--td-text-color-secondary);
}

.info-value {
  color: var(--td-text-color-primary);
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

.backup-list {
  margin-top: 24px;
  border-top: 1px solid var(--td-border-level-1-color);
  padding-top: 24px;
}

.backup-list-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 0 0 16px 0;
}

.backup-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--td-bg-color-container);
  border: 1px solid var(--td-border-level-1-color);
  border-radius: 8px;
  margin-bottom: 12px;
  transition: all 0.2s;
}

.backup-item:hover {
  border-color: var(--td-brand-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.backup-info {
  flex: 1;
}

.backup-name {
  font-weight: 500;
  color: var(--td-text-color-primary);
  margin-bottom: 4px;
}

.backup-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: var(--td-text-color-secondary);
}

.backup-actions {
  display: flex;
  gap: 8px;
}

.migrate-form {
  max-width: 800px;
}

.migration-result {
  margin-top: 24px;
}

.migration-details {
  margin-top: 16px;
}

.migration-details p {
  margin: 8px 0;
}

.migration-details ul {
  margin: 12px 0;
  padding-left: 20px;
}

.migration-details li {
  margin: 4px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-section {
    padding: 24px 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .section-title {
    font-size: 18px;
  }
  
  .form-section-title {
    font-size: 15px;
  }
  
  .storage-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .storage-actions {
    align-self: stretch;
    justify-content: flex-end;
  }

  .backup-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .backup-actions {
    align-self: stretch;
    justify-content: flex-end;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions .t-button {
    width: 100%;
  }
}
</style>