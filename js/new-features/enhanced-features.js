/**
 * ========================================
 * 🚀 Enhanced Features - الميزات المتقدمة
 * ========================================
 * 
 * يحتوي على:
 * 1. نظام تسجيل الموقع الجغرافي GPS
 * 2. نظام ألبوم الصور المحسّن
 * 3. قائمة القائمين بالتقييم
 * 4. إصلاحات تصدير Excel
 * 5. إدارة المستودعات المحسّنة
 * 
 * محدّث للعمل مع Supabase
 */

// ===== GPS Location System =====
window.NFGeolocation = (function() {
    'use strict';
    
    let currentPosition = null;
    let watchId = null;
    
    // Get current GPS location
    function getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('الجهاز لا يدعم GPS'));
                return;
            }
            
            const options = {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            };
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    currentPosition = {
                        latitude: position.coords.latitude.toFixed(6),
                        longitude: position.coords.longitude.toFixed(6),
                        accuracy: position.coords.accuracy,
                        timestamp: new Date().toISOString()
                    };
                    resolve(currentPosition);
                },
                (error) => {
                    let message = 'خطأ في تحديد الموقع';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            message = 'تم رفض إذن الوصول للموقع';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            message = 'معلومات الموقع غير متاحة';
                            break;
                        case error.TIMEOUT:
                            message = 'انتهى وقت طلب الموقع';
                            break;
                    }
                    reject(new Error(message));
                },
                options
            );
        });
    }
    
    // Watch location changes
    function watchLocation(callback) {
        if (!navigator.geolocation) {
            console.error('الجهاز لا يدعم GPS');
            return null;
        }
        
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                currentPosition = {
                    latitude: position.coords.latitude.toFixed(6),
                    longitude: position.coords.longitude.toFixed(6),
                    accuracy: position.coords.accuracy,
                    timestamp: new Date().toISOString()
                };
                if (callback) callback(currentPosition);
            },
            (error) => console.error('Watch error:', error),
            { enableHighAccuracy: true }
        );
        
        return watchId;
    }
    
    // Stop watching
    function stopWatch() {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }
    }
    
    // Get Google Maps URL
    function getMapsUrl(lat, lng) {
        return `https://www.google.com/maps?q=${lat},${lng}`;
    }
    
    // Get current cached position
    function getPosition() {
        return currentPosition;
    }
    
    console.log('📍 NFGeolocation initialized');
    
    return {
        getCurrentLocation,
        watchLocation,
        stopWatch,
        getMapsUrl,
        getPosition
    };
})();


// ===== Photo Album System =====
window.NFPhotoAlbum = (function() {
    'use strict';
    
    let currentImages = [];
    let currentIndex = 0;
    
    // Create album view
    function createAlbumView(images, vehicleInfo = {}) {
        currentImages = images || [];
        
        return `
            <div class="nf-album-container">
                <div class="nf-album-header">
                    <h2><i class="fas fa-images"></i> ألبوم صور المركبة</h2>
                    ${vehicleInfo.make ? `
                        <div class="nf-album-vehicle-info">
                            ${vehicleInfo.make} ${vehicleInfo.model} ${vehicleInfo.year || ''}
                        </div>
                    ` : ''}
                </div>
                
                <div class="nf-album-stats">
                    <span><i class="fas fa-images"></i> ${currentImages.length} صورة</span>
                </div>
                
                <div class="nf-album-grid">
                    ${currentImages.length === 0 ? `
                        <div class="nf-empty-state">
                            <i class="fas fa-images"></i>
                            <h3>لا توجد صور</h3>
                        </div>
                    ` : currentImages.map((img, index) => `
                        <div class="nf-album-item" onclick="NFPhotoAlbum.openLightbox(${index})">
                            <span class="nf-album-number">${index + 1}</span>
                            <img src="${img}" alt="صورة ${index + 1}" loading="lazy">
                            <div class="nf-album-overlay">
                                <i class="fas fa-search-plus"></i>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Open lightbox
    function openLightbox(index) {
        currentIndex = index;
        const lightbox = document.getElementById('nfLightbox');
        if (lightbox) {
            document.getElementById('nfLightboxImage').src = currentImages[currentIndex];
            document.getElementById('nfLightboxCounter').textContent = `${currentIndex + 1} / ${currentImages.length}`;
            lightbox.classList.add('show');
        }
    }
    
    // Close lightbox
    function closeLightbox() {
        document.getElementById('nfLightbox')?.classList.remove('show');
    }
    
    // Next image
    function nextImage() {
        currentIndex = (currentIndex + 1) % currentImages.length;
        document.getElementById('nfLightboxImage').src = currentImages[currentIndex];
        document.getElementById('nfLightboxCounter').textContent = `${currentIndex + 1} / ${currentImages.length}`;
    }
    
    // Previous image
    function prevImage() {
        currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
        document.getElementById('nfLightboxImage').src = currentImages[currentIndex];
        document.getElementById('nfLightboxCounter').textContent = `${currentIndex + 1} / ${currentImages.length}`;
    }
    
    // Create lightbox HTML
    function createLightboxHTML() {
        return `
            <div class="nf-lightbox" id="nfLightbox">
                <button class="nf-lightbox-close" onclick="NFPhotoAlbum.closeLightbox()">
                    <i class="fas fa-times"></i>
                </button>
                <button class="nf-lightbox-nav nf-lightbox-prev" onclick="NFPhotoAlbum.prevImage()">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <img id="nfLightboxImage" src="" alt="">
                <button class="nf-lightbox-nav nf-lightbox-next" onclick="NFPhotoAlbum.nextImage()">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div class="nf-lightbox-counter" id="nfLightboxCounter">1 / 1</div>
            </div>
        `;
    }
    
    console.log('🖼️ NFPhotoAlbum initialized');
    
    return {
        createAlbumView,
        openLightbox,
        closeLightbox,
        nextImage,
        prevImage,
        createLightboxHTML
    };
})();


// ===== Evaluators Management System =====
window.NFEvaluators = (function() {
    'use strict';
    
    const DEFAULT_EVALUATORS = [
        { id: 'eval1', name: 'محمد أحمد', employee_id: 'EMP001', phone: '0501234567' },
        { id: 'eval2', name: 'أحمد علي', employee_id: 'EMP002', phone: '0509876543' },
        { id: 'eval3', name: 'خالد محمد', employee_id: 'EMP003', phone: '0551122334' }
    ];
    
    // Get all evaluators
    async function getEvaluators() {
        if (!window.currentUser || !window.supabaseClient) {
            return DEFAULT_EVALUATORS;
        }
        
        try {
            const { data, error } = await window.supabaseClient
                .from('evaluators')
                .select('*')
                .eq('user_id', window.currentUser.id)
                .order('name');
            
            if (error) throw error;
            
            if (!data || data.length === 0) {
                // Seed default evaluators
                await seedDefaultEvaluators();
                return DEFAULT_EVALUATORS;
            }
            
            return data;
        } catch (error) {
            console.error('Error fetching evaluators:', error);
            return DEFAULT_EVALUATORS;
        }
    }
    
    // Seed default evaluators
    async function seedDefaultEvaluators() {
        if (!window.currentUser || !window.supabaseClient) return;
        
        try {
            const evaluators = DEFAULT_EVALUATORS.map(e => ({
                user_id: window.currentUser.id,
                name: e.name,
                employee_id: e.employee_id,
                phone: e.phone
            }));
            
            await window.supabaseClient
                .from('evaluators')
                .insert(evaluators);
        } catch (error) {
            console.error('Error seeding evaluators:', error);
        }
    }
    
    // Add evaluator
    async function addEvaluator(evaluatorData) {
        if (!window.currentUser || !window.supabaseClient) return null;
        
        try {
            const evaluator = {
                user_id: window.currentUser.id,
                name: evaluatorData.name,
                employee_id: evaluatorData.employee_id || '',
                phone: evaluatorData.phone || ''
            };
            
            const { data, error } = await window.supabaseClient
                .from('evaluators')
                .insert([evaluator])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error adding evaluator:', error);
            throw error;
        }
    }
    
    // Delete evaluator
    async function deleteEvaluator(evaluatorId) {
        if (!window.currentUser || !window.supabaseClient) return;
        
        try {
            const { error } = await window.supabaseClient
                .from('evaluators')
                .delete()
                .eq('id', evaluatorId);
            
            if (error) throw error;
        } catch (error) {
            console.error('Error deleting evaluator:', error);
            throw error;
        }
    }
    
    // Create evaluator selector
    function createEvaluatorSelector(evaluators, selectedId = '') {
        return `
            <select class="form-input" id="evaluatorSelect">
                <option value="">-- اختر القائم بالتقييم --</option>
                ${evaluators.map(e => `
                    <option value="${e.id}" data-name="${e.name}" data-employee-id="${e.employee_id || ''}" ${e.id === selectedId ? 'selected' : ''}>
                        ${e.name} ${e.employee_id ? `(${e.employee_id})` : ''}
                    </option>
                `).join('')}
                <option value="new">➕ إضافة قائم جديد...</option>
            </select>
        `;
    }
    
    // Populate evaluator selector
    async function populateEvaluatorSelector(selectId = 'evaluatorSelect', selectedId = '') {
        const evaluators = await getEvaluators();
        const select = document.getElementById(selectId);
        if (!select) return;
        
        select.innerHTML = `
            <option value="">-- اختر القائم بالتقييم --</option>
            ${evaluators.map(e => `
                <option value="${e.id}" data-name="${e.name}" data-employee-id="${e.employee_id || ''}" ${e.id === selectedId ? 'selected' : ''}>
                    ${e.name} ${e.employee_id ? `(${e.employee_id})` : ''}
                </option>
            `).join('')}
            <option value="new">➕ إضافة قائم جديد...</option>
        `;
        
        // Handle new evaluator selection
        select.addEventListener('change', (e) => {
            if (e.target.value === 'new') {
                showAddEvaluatorModal();
                e.target.value = '';
            }
        });
    }
    
    // Show add evaluator modal
    function showAddEvaluatorModal() {
        const modal = document.createElement('div');
        modal.id = 'addEvaluatorModal';
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h3><i class="fas fa-user-plus"></i> إضافة قائم بالتقييم</h3>
                    <button class="btn-close" onclick="NFEvaluators.closeAddModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>الاسم *</label>
                        <input type="text" class="form-input" id="evalName" placeholder="اسم القائم بالتقييم">
                    </div>
                    <div class="form-group">
                        <label>الرقم الوظيفي</label>
                        <input type="text" class="form-input" id="evalEmployeeId" placeholder="مثال: EMP001">
                    </div>
                    <div class="form-group">
                        <label>رقم الهاتف</label>
                        <input type="text" class="form-input" id="evalPhone" placeholder="مثال: 0501234567">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="NFEvaluators.closeAddModal()">إلغاء</button>
                    <button class="btn btn-primary" onclick="NFEvaluators.saveEvaluator()">
                        <i class="fas fa-save"></i> حفظ
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Close add modal
    function closeAddModal() {
        const modal = document.getElementById('addEvaluatorModal');
        if (modal) modal.remove();
    }
    
    // Save evaluator
    async function saveEvaluator() {
        const name = document.getElementById('evalName')?.value.trim();
        const employee_id = document.getElementById('evalEmployeeId')?.value.trim();
        const phone = document.getElementById('evalPhone')?.value.trim();
        
        if (!name) {
            if (window.showNotification) {
                showNotification('يرجى إدخال اسم القائم بالتقييم', 'warning');
            }
            return;
        }
        
        try {
            await addEvaluator({ name, employee_id, phone });
            closeAddModal();
            if (window.showNotification) {
                showNotification('تم إضافة القائم بالتقييم بنجاح', 'success');
            }
            // Refresh selector
            await populateEvaluatorSelector();
        } catch (error) {
            if (window.showNotification) {
                showNotification('خطأ في الإضافة: ' + error.message, 'error');
            }
        }
    }
    
    // Create evaluators page HTML
    function createEvaluatorsPageHTML(evaluators, vehicleStats = {}) {
        return `
            <div class="nf-evaluators-page">
                <div class="nf-evaluators-header">
                    <h2><i class="fas fa-users"></i> إدارة القائمين بالتقييم</h2>
                    <button class="btn btn-primary" onclick="NFEvaluators.showAddEvaluatorModal()">
                        <i class="fas fa-user-plus"></i> إضافة قائم
                    </button>
                </div>
                
                <div class="nf-evaluators-grid">
                    ${evaluators.length === 0 ? `
                        <div class="nf-empty-state" style="grid-column: 1/-1;">
                            <i class="fas fa-users"></i>
                            <h3>لا يوجد قائمون بالتقييم</h3>
                            <p>أضف قائم جديد للبدء</p>
                        </div>
                    ` : evaluators.map(e => `
                        <div class="nf-evaluator-card">
                            <div class="nf-evaluator-avatar">
                                ${e.name.charAt(0)}
                            </div>
                            <div class="nf-evaluator-info">
                                <h4>${e.name}</h4>
                                ${e.employee_id ? `<p><i class="fas fa-id-badge"></i> ${e.employee_id}</p>` : ''}
                                ${e.phone ? `<p><i class="fas fa-phone"></i> ${e.phone}</p>` : ''}
                                <p class="nf-eval-stats"><i class="fas fa-car"></i> ${vehicleStats[e.id] || 0} مركبة</p>
                            </div>
                            <div class="nf-evaluator-actions">
                                <button class="btn btn-danger btn-sm" onclick="NFEvaluators.confirmDelete('${e.id}', '${e.name}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    async function confirmDelete(evaluatorId, name) {
        if (confirm(`هل أنت متأكد من حذف "${name}"؟`)) {
            try {
                await deleteEvaluator(evaluatorId);
                if (window.showNotification) {
                    showNotification('تم حذف القائم بالتقييم', 'success');
                }
                if (window.loadEvaluatorsPage) {
                    loadEvaluatorsPage();
                }
            } catch (error) {
                if (window.showNotification) {
                    showNotification('خطأ في الحذف: ' + error.message, 'error');
                }
            }
        }
    }
    
    console.log('👤 NFEvaluators (Supabase) initialized');
    
    return {
        getEvaluators,
        addEvaluator,
        deleteEvaluator,
        createEvaluatorSelector,
        populateEvaluatorSelector,
        showAddEvaluatorModal,
        closeAddModal,
        saveEvaluator,
        createEvaluatorsPageHTML,
        confirmDelete
    };
})();


// ===== Operation Status System =====
window.NFOperationStatus = (function() {
    'use strict';
    
    const STATUSES = {
        working: { label: 'تعمل', color: 'success', icon: 'fa-check-circle' },
        not_working: { label: 'لا تعمل', color: 'danger', icon: 'fa-times-circle' },
        needs_maintenance: { label: 'تحتاج صيانة', color: 'warning', icon: 'fa-wrench' }
    };
    
    function getStatusInfo(status) {
        return STATUSES[status] || { label: status, color: 'secondary', icon: 'fa-question-circle' };
    }
    
    function renderStatusBadge(status) {
        const info = getStatusInfo(status);
        return `<span class="nf-status-badge nf-status-${info.color}"><i class="fas ${info.icon}"></i> ${info.label}</span>`;
    }
    
    function createStatusSelector(selectedStatus = '') {
        return `
            <select class="form-input" id="operationStatus">
                <option value="">-- اختر حالة التشغيل --</option>
                ${Object.entries(STATUSES).map(([key, val]) => `
                    <option value="${key}" ${key === selectedStatus ? 'selected' : ''}>${val.label}</option>
                `).join('')}
            </select>
        `;
    }
    
    return {
        STATUSES,
        getStatusInfo,
        renderStatusBadge,
        createStatusSelector
    };
})();


// ===== Initialize all enhanced features =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Enhanced Features (Supabase) loaded');
});
