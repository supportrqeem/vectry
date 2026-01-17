/**
 * ========================================
 * 📋 Activity Log & Warehouse Management
 * ========================================
 * 
 * نظام سجل النشاطات وإدارة المستودعات
 * محدّث للعمل مع Supabase
 * 
 * ⚠️ لا يعدل أي JavaScript موجود - إضافة فقط!
 */

// ===== Activity Log System =====
window.NFActivity = (function() {
    'use strict';
    
    const ACTIVITY_TYPES = {
        VEHICLE_ADDED: { icon: 'fa-plus-circle', color: 'success', label: 'إضافة مركبة' },
        VEHICLE_UPDATED: { icon: 'fa-edit', color: 'warning', label: 'تعديل مركبة' },
        VEHICLE_DELETED: { icon: 'fa-trash', color: 'danger', label: 'حذف مركبة' },
        VEHICLE_VIEWED: { icon: 'fa-eye', color: 'info', label: 'عرض مركبة' },
        EXPORT_EXCEL: { icon: 'fa-file-excel', color: 'success', label: 'تصدير Excel' },
        EXPORT_JSON: { icon: 'fa-file-code', color: 'info', label: 'تصدير JSON' },
        IMPORT_DATA: { icon: 'fa-file-import', color: 'primary', label: 'استيراد بيانات' },
        WAREHOUSE_TRANSFER: { icon: 'fa-warehouse', color: 'warning', label: 'نقل للمستودع' },
        STATUS_CHANGE: { icon: 'fa-cog', color: 'info', label: 'تغيير الحالة' },
        LOGIN: { icon: 'fa-sign-in-alt', color: 'success', label: 'تسجيل دخول' },
        LOGOUT: { icon: 'fa-sign-out-alt', color: 'warning', label: 'تسجيل خروج' }
    };
    
    // Log activity to Supabase
    async function logActivity(type, details = {}) {
        if (!window.currentUser || !window.supabaseClient) return;
        
        try {
            const activity = {
                type: type,
                details: details,
                user_id: window.currentUser.id,
                created_at: new Date().toISOString()
            };
            
            const { error } = await window.supabaseClient
                .from('activities')
                .insert([activity]);
                
            if (error) throw error;
            console.log('Activity logged:', type);
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }
    
    // Get recent activities
    async function getActivities(limit = 50) {
        if (!window.currentUser || !window.supabaseClient) return [];
        
        try {
            const { data, error } = await window.supabaseClient
                .from('activities')
                .select('*')
                .eq('user_id', window.currentUser.id)
                .order('created_at', { ascending: false })
                .limit(limit);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching activities:', error);
            return [];
        }
    }
    
    // Alias for getActivities
    async function getAll(limit = 50) {
        return getActivities(limit);
    }
    
    // Format activity for display
    function formatActivity(activity) {
        const typeInfo = ACTIVITY_TYPES[activity.type] || { 
            icon: 'fa-circle', 
            color: 'secondary', 
            label: activity.type 
        };
        
        const timestamp = new Date(activity.created_at);
        const timeAgo = getTimeAgo(timestamp);
        const formattedDate = timestamp.toLocaleString('ar-SA');
        
        return {
            ...activity,
            typeInfo,
            timeAgo,
            formattedDate
        };
    }
    
    // Get time ago string
    function getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        
        if (diffSec < 60) return 'الآن';
        if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
        if (diffHour < 24) return `منذ ${diffHour} ساعة`;
        if (diffDay < 7) return `منذ ${diffDay} يوم`;
        
        return date.toLocaleDateString('ar-SA');
    }
    
    // Create activities page HTML
    function createPageHTML(activities) {
        const formattedActivities = activities.map(formatActivity);
        
        return `
            <div class="nf-activities-page">
                <div class="nf-activities-header">
                    <h2><i class="fas fa-history"></i> سجل النشاطات</h2>
                    <div class="nf-activities-stats">${activities.length} نشاط</div>
                </div>
                
                <div class="nf-activities-filters">
                    <select class="nf-filter-select" id="activityTypeFilter" onchange="NFActivity.filterActivities()">
                        <option value="">جميع الأنواع</option>
                        ${Object.entries(ACTIVITY_TYPES).map(([key, val]) => 
                            `<option value="${key}">${val.label}</option>`
                        ).join('')}
                    </select>
                    <button class="btn btn-outline btn-sm" onclick="NFActivity.refreshActivities()">
                        <i class="fas fa-sync-alt"></i> تحديث
                    </button>
                </div>
                
                <div class="nf-activities-list" id="activitiesList">
                    ${formattedActivities.length === 0 ? `
                        <div class="nf-empty-state">
                            <i class="fas fa-inbox"></i>
                            <h3>لا توجد نشاطات</h3>
                            <p>سيتم تسجيل جميع النشاطات هنا</p>
                        </div>
                    ` : formattedActivities.map(a => `
                        <div class="nf-activity-item">
                            <div class="nf-activity-icon nf-activity-${a.typeInfo.color}">
                                <i class="fas ${a.typeInfo.icon}"></i>
                            </div>
                            <div class="nf-activity-content">
                                <div class="nf-activity-title">${a.typeInfo.label}</div>
                                ${a.details ? `<div class="nf-activity-details">${formatDetails(a.details)}</div>` : ''}
                            </div>
                            <div class="nf-activity-meta">
                                <div class="nf-activity-time">${a.timeAgo}</div>
                                <div class="nf-activity-date">${a.formattedDate}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    function formatDetails(details) {
        if (typeof details === 'string') return details;
        if (typeof details === 'object') {
            const parts = [];
            if (details.vehicleName) parts.push(details.vehicleName);
            if (details.contractNo) parts.push(`عقد: ${details.contractNo}`);
            if (details.count) parts.push(`${details.count} مركبة`);
            return parts.join(' - ') || '';
        }
        return '';
    }
    
    async function refreshActivities() {
        const activities = await getActivities(100);
        const listEl = document.getElementById('activitiesList');
        if (listEl) {
            const formattedActivities = activities.map(formatActivity);
            listEl.innerHTML = formattedActivities.length === 0 ? `
                <div class="nf-empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>لا توجد نشاطات</h3>
                </div>
            ` : formattedActivities.map(a => `
                <div class="nf-activity-item">
                    <div class="nf-activity-icon nf-activity-${a.typeInfo.color}">
                        <i class="fas ${a.typeInfo.icon}"></i>
                    </div>
                    <div class="nf-activity-content">
                        <div class="nf-activity-title">${a.typeInfo.label}</div>
                        ${a.details ? `<div class="nf-activity-details">${formatDetails(a.details)}</div>` : ''}
                    </div>
                    <div class="nf-activity-meta">
                        <div class="nf-activity-time">${a.timeAgo}</div>
                    </div>
                </div>
            `).join('');
        }
    }
    
    function filterActivities() {
        const filter = document.getElementById('activityTypeFilter')?.value;
        const items = document.querySelectorAll('.nf-activity-item');
        items.forEach(item => {
            if (!filter) {
                item.style.display = '';
            } else {
                const title = item.querySelector('.nf-activity-title')?.textContent;
                const typeInfo = ACTIVITY_TYPES[filter];
                item.style.display = title === typeInfo?.label ? '' : 'none';
            }
        });
    }
    
    console.log('📋 NFActivity (Supabase) initialized');
    
    return {
        TYPES: ACTIVITY_TYPES,
        log: logActivity,
        getAll: getAll,
        getActivities: getActivities,
        format: formatActivity,
        createPageHTML: createPageHTML,
        refreshActivities: refreshActivities,
        filterActivities: filterActivities
    };
})();


// ===== Warehouse Management System =====
window.NFWarehouse = (function() {
    'use strict';
    
    // Get all warehouses
    async function getWarehouses() {
        if (!window.currentUser || !window.supabaseClient) return [];
        
        try {
            const { data, error } = await window.supabaseClient
                .from('warehouses')
                .select('*')
                .eq('user_id', window.currentUser.id)
                .order('name');
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching warehouses:', error);
            return [];
        }
    }
    
    // Alias for getWarehouses
    async function getAll() {
        return getWarehouses();
    }
    
    // Add warehouse
    async function addWarehouse(warehouseData) {
        if (!window.currentUser || !window.supabaseClient) return null;
        
        try {
            const warehouse = {
                user_id: window.currentUser.id,
                name: warehouseData.name,
                location: warehouseData.location || '',
                capacity: warehouseData.capacity || 50,
                manager_name: warehouseData.manager_name || '',
                manager_phone: warehouseData.manager_phone || ''
            };
            
            const { data, error } = await window.supabaseClient
                .from('warehouses')
                .insert([warehouse])
                .select()
                .single();
            
            if (error) throw error;
            
            if (window.NFActivity) {
                window.NFActivity.log('WAREHOUSE_ADDED', { warehouseName: warehouse.name });
            }
            
            return data;
        } catch (error) {
            console.error('Error adding warehouse:', error);
            throw error;
        }
    }
    
    // Delete warehouse
    async function deleteWarehouse(warehouseId) {
        if (!window.currentUser || !window.supabaseClient) return;
        
        try {
            // Check if warehouse has vehicles
            const { data: vehicles } = await window.supabaseClient
                .from('vehicles')
                .select('id')
                .eq('warehouse_id', warehouseId)
                .limit(1);
            
            if (vehicles && vehicles.length > 0) {
                throw new Error('لا يمكن حذف مستودع يحتوي على مركبات');
            }
            
            const { error } = await window.supabaseClient
                .from('warehouses')
                .delete()
                .eq('id', warehouseId);
            
            if (error) throw error;
            
            if (window.NFActivity) {
                window.NFActivity.log('WAREHOUSE_DELETED', { warehouseId });
            }
        } catch (error) {
            console.error('Error deleting warehouse:', error);
            throw error;
        }
    }
    
    // Get warehouse stats
    function getStats(vehicles) {
        const stats = {};
        const warehouses = new Set();
        
        vehicles.forEach(v => {
            if (v.warehouse_id) {
                warehouses.add(v.warehouse_id);
                stats[v.warehouse_id] = (stats[v.warehouse_id] || 0) + 1;
            }
        });
        
        return {
            totalWarehouses: warehouses.size,
            totalVehicles: vehicles.length,
            unassigned: vehicles.filter(v => !v.warehouse_id).length,
            perWarehouse: stats
        };
    }
    
    // Create warehouse selector HTML
    function createSelector(warehouses, selectedId = '') {
        return `
            <select class="form-input" id="vehicleWarehouse">
                <option value="">-- اختر المستودع --</option>
                ${warehouses.map(w => `
                    <option value="${w.id}" ${w.id === selectedId ? 'selected' : ''}>
                        ${w.name} (${w.location || 'بدون موقع'})
                    </option>
                `).join('')}
            </select>
        `;
    }
    
    // Create warehouse page HTML
    function createWarehousePageHTML(warehouses, stats) {
        return `
            <div class="nf-warehouse-page">
                <div class="nf-warehouse-header">
                    <h2><i class="fas fa-warehouse"></i> إدارة المستودعات</h2>
                    <button class="btn btn-primary" onclick="NFWarehouseEnhanced.showAddModal()">
                        <i class="fas fa-plus"></i> إضافة مستودع
                    </button>
                </div>
                
                <div class="nf-warehouse-stats">
                    <div class="nf-wh-stat-card">
                        <div class="nf-wh-stat-icon" style="background: var(--primary);">
                            <i class="fas fa-warehouse"></i>
                        </div>
                        <div class="nf-wh-stat-value">${warehouses.length}</div>
                        <div class="nf-wh-stat-label">المستودعات</div>
                    </div>
                    <div class="nf-wh-stat-card">
                        <div class="nf-wh-stat-icon" style="background: var(--success);">
                            <i class="fas fa-car"></i>
                        </div>
                        <div class="nf-wh-stat-value">${stats.totalVehicles}</div>
                        <div class="nf-wh-stat-label">المركبات</div>
                    </div>
                    <div class="nf-wh-stat-card">
                        <div class="nf-wh-stat-icon" style="background: var(--warning);">
                            <i class="fas fa-exclamation-circle"></i>
                        </div>
                        <div class="nf-wh-stat-value">${stats.unassigned}</div>
                        <div class="nf-wh-stat-label">غير مخصصة</div>
                    </div>
                </div>
                
                <div class="nf-warehouse-grid">
                    ${warehouses.length === 0 ? `
                        <div class="nf-empty-state" style="grid-column: 1/-1;">
                            <i class="fas fa-warehouse"></i>
                            <h3>لا توجد مستودعات</h3>
                            <p>أضف مستودع جديد للبدء</p>
                        </div>
                    ` : warehouses.map(w => {
                        const vehicleCount = stats.perWarehouse[w.id] || 0;
                        const percentage = Math.min((vehicleCount / (w.capacity || 50)) * 100, 100);
                        const statusClass = percentage >= 90 ? 'full' : percentage >= 70 ? 'warning' : 'ok';
                        
                        return `
                            <div class="nf-warehouse-card">
                                <div class="nf-warehouse-card-header">
                                    <h3><i class="fas fa-warehouse"></i> ${w.name}</h3>
                                    <span class="nf-warehouse-location"><i class="fas fa-map-marker-alt"></i> ${w.location || '-'}</span>
                                </div>
                                <div class="nf-warehouse-card-body">
                                    ${w.manager_name ? `
                                        <div class="nf-warehouse-manager">
                                            <i class="fas fa-user-tie"></i>
                                            <span>${w.manager_name}</span>
                                            ${w.manager_phone ? `<span class="nf-manager-phone">${w.manager_phone}</span>` : ''}
                                        </div>
                                    ` : ''}
                                    <div class="nf-capacity-bar">
                                        <div class="nf-capacity-fill nf-capacity-${statusClass}" style="width: ${percentage}%"></div>
                                    </div>
                                    <div class="nf-capacity-text">${vehicleCount} / ${w.capacity || 50} مركبة</div>
                                </div>
                                <div class="nf-warehouse-card-actions">
                                    <button class="btn btn-outline btn-sm" onclick="NFWarehouseEnhanced.viewVehicles('${w.id}')">
                                        <i class="fas fa-car"></i> عرض المركبات
                                    </button>
                                    <button class="btn btn-danger btn-sm" onclick="NFWarehouseEnhanced.confirmDelete('${w.id}', '${w.name}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <!-- Add Warehouse Modal -->
            <div class="modal" id="addWarehouseModal">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-plus"></i> إضافة مستودع جديد</h3>
                        <button class="btn-close" onclick="NFWarehouseEnhanced.closeAddModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>اسم المستودع *</label>
                            <input type="text" class="form-input" id="whName" placeholder="أدخل اسم المستودع">
                        </div>
                        <div class="form-group">
                            <label>الموقع *</label>
                            <input type="text" class="form-input" id="whLocation" placeholder="أدخل موقع المستودع">
                        </div>
                        <div class="form-group">
                            <label>السعة</label>
                            <input type="number" class="form-input" id="whCapacity" value="50" min="1">
                        </div>
                        <div class="form-group">
                            <label>اسم المسؤول</label>
                            <input type="text" class="form-input" id="whManager" placeholder="اسم مسؤول المستودع">
                        </div>
                        <div class="form-group">
                            <label>هاتف المسؤول</label>
                            <input type="text" class="form-input" id="whManagerPhone" placeholder="رقم هاتف المسؤول">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="NFWarehouseEnhanced.closeAddModal()">إلغاء</button>
                        <button class="btn btn-primary" onclick="NFWarehouseEnhanced.saveWarehouse()">
                            <i class="fas fa-save"></i> حفظ
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    console.log('📦 NFWarehouse (Supabase) initialized');
    
    return {
        getAll: getAll,
        getWarehouses: getWarehouses,
        add: addWarehouse,
        delete: deleteWarehouse,
        getStats: getStats,
        createSelector: createSelector,
        createWarehousePageHTML: createWarehousePageHTML
    };
})();


// ===== Enhanced Warehouse UI =====
window.NFWarehouseEnhanced = (function() {
    'use strict';
    
    function showAddModal() {
        document.getElementById('addWarehouseModal')?.classList.add('show');
    }
    
    function closeAddModal() {
        document.getElementById('addWarehouseModal')?.classList.remove('show');
    }
    
    async function saveWarehouse() {
        const name = document.getElementById('whName')?.value.trim();
        const location = document.getElementById('whLocation')?.value.trim();
        const capacity = parseInt(document.getElementById('whCapacity')?.value) || 50;
        const manager_name = document.getElementById('whManager')?.value.trim();
        const manager_phone = document.getElementById('whManagerPhone')?.value.trim();
        
        if (!name || !location) {
            if (window.showNotification) {
                showNotification('يرجى إدخال اسم المستودع والموقع', 'warning');
            }
            return;
        }
        
        try {
            await window.NFWarehouse.add({ name, location, capacity, manager_name, manager_phone });
            closeAddModal();
            if (window.showNotification) {
                showNotification('تم إضافة المستودع بنجاح', 'success');
            }
            // Refresh warehouse page
            if (window.loadWarehousePage) {
                loadWarehousePage();
            }
        } catch (error) {
            if (window.showNotification) {
                showNotification('خطأ في إضافة المستودع: ' + error.message, 'error');
            }
        }
    }
    
    async function confirmDelete(warehouseId, warehouseName) {
        if (confirm(`هل أنت متأكد من حذف مستودع "${warehouseName}"؟`)) {
            try {
                await window.NFWarehouse.delete(warehouseId);
                if (window.showNotification) {
                    showNotification('تم حذف المستودع بنجاح', 'success');
                }
                if (window.loadWarehousePage) {
                    loadWarehousePage();
                }
            } catch (error) {
                if (window.showNotification) {
                    showNotification(error.message, 'error');
                }
            }
        }
    }
    
    function viewVehicles(warehouseId) {
        if (window.filterByWarehouse) {
            filterByWarehouse(warehouseId);
        }
    }
    
    return {
        showAddModal,
        closeAddModal,
        saveWarehouse,
        confirmDelete,
        viewVehicles
    };
})();
