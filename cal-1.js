// Data storage
let foodItems = [];
let meals = [];
let currentMealIngredients = [];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateFoodSelect();
    displayFoodItems();
    displayMeals();
    updateDailySummary();
});

// Tab switching
function switchTab(tabId) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// Add food item
function addFoodItem() {
    const name = document.getElementById('food-name').value.trim();
    const calories = parseFloat(document.getElementById('food-calories').value);

    if (!name || !calories || calories <= 0) {
        alert('يرجى إدخال اسم العنصر والسعرات الحرارية بشكل صحيح');
        return;
    }

    const foodItem = {
        id: Date.now(),
        name: name,
        calories: calories
    };

    foodItems.push(foodItem);
    saveData();
    updateFoodSelect();
    displayFoodItems();
    updateDailySummary();

    // Clear form
    document.getElementById('food-name').value = '';
    document.getElementById('food-calories').value = '';
}

// Display food items
function displayFoodItems() {
    const foodList = document.getElementById('food-list');
    
    if (foodItems.length === 0) {
        foodList.innerHTML = '<div class="empty-state"><h3>لا توجد عناصر غذائية مضافة</h3><p>ابدأ بإضافة عناصر غذائية لتتبع وجباتك</p></div>';
        return;
    }

    foodList.innerHTML = foodItems.map(item => `
        <div class="food-item">
            <div class="food-info">
                <div class="food-details">
                    <h3>${item.name}</h3>
                    <p><strong>${item.calories}</strong> سعرة حرارية لكل 100 غرام</p>
                </div>
                <div class="food-actions">
                    <button class="btn btn-danger" onclick="deleteFoodItem(${item.id})">حذف</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Delete food item
function deleteFoodItem(id) {
    if (confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
        foodItems = foodItems.filter(item => item.id !== id);
        saveData();
        updateFoodSelect();
        displayFoodItems();
        updateDailySummary();
    }
}

// Update food select dropdown
function updateFoodSelect() {
    const select = document.getElementById('food-select');
    select.innerHTML = '<option value="">اختر عنصر غذائي</option>';
    
    foodItems.forEach(item => {
        select.innerHTML += `<option value="${item.id}">${item.name}</option>`;
    });
}

// Add ingredient to current meal
function addIngredient() {
    const selectedFoodId = document.getElementById('food-select').value;
    const quantity = parseFloat(document.getElementById('food-quantity').value);

    if (!selectedFoodId || !quantity || quantity <= 0) {
        alert('يرجى اختيار عنصر غذائي وإدخال الكمية');
        return;
    }

    const foodItem = foodItems.find(item => item.id == selectedFoodId);
    const ingredient = {
        id: Date.now(),
        name: foodItem.name,
        calories: foodItem.calories,
        quantity: quantity,
        totalCalories: (foodItem.calories * quantity) / 100
    };

    currentMealIngredients.push(ingredient);
    displayCurrentMealIngredients();

    // Clear form
    document.getElementById('food-select').value = '';
    document.getElementById('food-quantity').value = '';
}

// Display current meal ingredients
function displayCurrentMealIngredients() {
    const container = document.getElementById('current-meal-ingredients');
    const ingredientsList = document.getElementById('ingredients-list');
    const totalCalories = document.getElementById('meal-total-calories');

    if (currentMealIngredients.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    
    ingredientsList.innerHTML = currentMealIngredients.map(ingredient => `
        <div class="ingredient-item">
            <span>${ingredient.name} - ${ingredient.quantity}غ</span>
            <div>
                <span style="margin-left: 10px;">${Math.round(ingredient.totalCalories)} سعرة</span>
                <button class="btn btn-danger" style="padding: 5px 10px; font-size: 12px;" onclick="removeIngredient(${ingredient.id})">حذف</button>
            </div>
        </div>
    `).join('');

    const total = currentMealIngredients.reduce((sum, ingredient) => sum + ingredient.totalCalories, 0);
    totalCalories.textContent = Math.round(total);
}

// Remove ingredient from current meal
function removeIngredient(id) {
    currentMealIngredients = currentMealIngredients.filter(ingredient => ingredient.id !== id);
    displayCurrentMealIngredients();
}

// Create meal
function createMeal() {
    const mealName = document.getElementById('meal-name').value.trim();

    if (!mealName) {
        alert('يرجى إدخال اسم الوجبة');
        return;
    }

    if (currentMealIngredients.length === 0) {
        alert('يرجى إضافة مكونات للوجبة');
        return;
    }

    const meal = {
        id: Date.now(),
        name: mealName,
        ingredients: [...currentMealIngredients],
        totalCalories: currentMealIngredients.reduce((sum, ingredient) => sum + ingredient.totalCalories, 0),
        date: new Date().toDateString()
    };

    meals.push(meal);
    saveData();
    displayMeals();
    updateDailySummary();

    // Clear form
    document.getElementById('meal-name').value = '';
    currentMealIngredients = [];
    displayCurrentMealIngredients();
}

// Display meals
function displayMeals() {
    const mealsList = document.getElementById('meals-list');
    
    if (meals.length === 0) {
        mealsList.innerHTML = '<div class="empty-state"><h3>لا توجد وجبات مسجلة</h3><p>ابدأ بإنشاء وجبة من العناصر الغذائية المتاحة</p></div>';
        return;
    }

    mealsList.innerHTML = meals.map(meal => `
        <div class="meal-item">
            <div class="food-info">
                <div class="food-details">
                    <h3>${meal.name}</h3>
                    <p><strong>${Math.round(meal.totalCalories)}</strong> سعرة حرارية</p>
                    <p>المكونات: ${meal.ingredients.map(ing => `${ing.name} (${ing.quantity}غ)`).join(', ')}</p>
                </div>
                <div class="food-actions">
                    <button class="btn btn-danger" onclick="deleteMeal(${meal.id})">حذف</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Delete meal
function deleteMeal(id) {
    if (confirm('هل أنت متأكد من حذف هذه الوجبة؟')) {
        meals = meals.filter(meal => meal.id !== id);
        saveData();
        displayMeals();
        updateDailySummary();
    }
}

// Update daily summary
function updateDailySummary() {
    const today = new Date().toDateString();
    const todayMeals = meals.filter(meal => meal.date === today);
    const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);
    const avgCaloriesPerMeal = todayMeals.length > 0 ? totalCalories / todayMeals.length : 0;

    document.getElementById('daily-total-calories').textContent = Math.round(totalCalories);
    document.getElementById('total-food-items').textContent = foodItems.length;
    document.getElementById('total-meals').textContent = todayMeals.length;
    document.getElementById('avg-calories-per-meal').textContent = Math.round(avgCaloriesPerMeal);
}

// Save data to localStorage
function saveData() {
    const data = {
        foodItems: foodItems,
        meals: meals
    };
    // In a real app, you would save to a database
    // For this demo, we'll just store in memory
}

// Load data from localStorage
function loadData() {
    // In a real app, you would load from a database
    // For this demo, we'll use comprehensive sample data
    if (foodItems.length === 0) {
        foodItems = [
            // اللحوم والدواجن
            { id: 1, name: 'صدور دجاج', calories: 165 },
            { id: 2, name: 'دجاج كامل', calories: 239 },
            { id: 3, name: 'كبدة بقري', calories: 135 },
            { id: 4, name: 'لحم بقري', calories: 250 },
            { id: 5, name: 'لحم غنم', calories: 294 },
            { id: 6, name: 'سلمون', calories: 208 },
            { id: 7, name: 'تونة', calories: 144 },
            { id: 8, name: 'جمبري', calories: 85 },
            
            // الخضروات
            { id: 9, name: 'بصل', calories: 40 },
            { id: 10, name: 'طماطم', calories: 18 },
            { id: 11, name: 'فلفل أخضر', calories: 20 },
            { id: 12, name: 'فلفل أحمر', calories: 31 },
            { id: 13, name: 'ثوم', calories: 149 },
            { id: 14, name: 'بروكلي', calories: 34 },
            { id: 15, name: 'جزر', calories: 41 },
            { id: 16, name: 'خيار', calories: 16 },
            { id: 17, name: 'خس', calories: 15 },
            { id: 18, name: 'سبانخ', calories: 23 },
            { id: 19, name: 'كوسة', calories: 17 },
            { id: 20, name: 'باذنجان', calories: 25 },
            
            // الحبوب والنشويات
            { id: 21, name: 'أرز أبيض', calories: 130 },
            { id: 22, name: 'أرز بني', calories: 111 },
            { id: 23, name: 'مكرونة', calories: 131 },
            { id: 24, name: 'خبز أبيض', calories: 265 },
            { id: 25, name: 'خبز أسمر', calories: 247 },
            { id: 26, name: 'توست', calories: 265 },
            { id: 27, name: 'شابورة', calories: 275 },
            { id: 28, name: 'بطاطس', calories: 77 },
            { id: 29, name: 'بطاطا حلوة', calories: 86 },
            { id: 30, name: 'شوفان', calories: 389 },
            
            // الألبان والجبن
            { id: 31, name: 'حليب كامل الدسم', calories: 61 },
            { id: 32, name: 'حليب منزوع الدسم', calories: 34 },
            { id: 33, name: 'جبنة بيضة بالقشطة', calories: 350 },
            { id: 34, name: 'جبنة رومي', calories: 373 },
            { id: 35, name: 'جبنة شيدر', calories: 403 },
            { id: 36, name: 'جبنة موزاريلا', calories: 280 },
            { id: 37, name: 'جبنة فيتا', calories: 264 },
            { id: 38, name: 'زبادي', calories: 59 },
            { id: 39, name: 'قشطة', calories: 345 },
            { id: 40, name: 'زبدة', calories: 717 },
            
            // الفواكه
            { id: 41, name: 'تفاح', calories: 52 },
            { id: 42, name: 'موز', calories: 89 },
            { id: 43, name: 'برتقال', calories: 47 },
            { id: 44, name: 'برقوق', calories: 46 },
            { id: 45, name: 'عنب', calories: 62 },
            { id: 46, name: 'فراولة', calories: 32 },
            { id: 47, name: 'مانجو', calories: 60 },
            { id: 48, name: 'أناناس', calories: 50 },
            { id: 49, name: 'رمان', calories: 83 },
            { id: 50, name: 'تين', calories: 74 },
            
            // المكسرات والبذور
            { id: 51, name: 'لوز', calories: 579 },
            { id: 52, name: 'فستق', calories: 560 },
            { id: 53, name: 'جوز', calories: 654 },
            { id: 54, name: 'بندق', calories: 628 },
            { id: 55, name: 'كاجو', calories: 553 },
            { id: 56, name: 'مكسرات مشكلة', calories: 607 },
            { id: 57, name: 'بذور عباد الشمس', calories: 584 },
            { id: 58, name: 'بذور اليقطين', calories: 559 },
            
            // الزيوت والدهون
            { id: 59, name: 'زيت زيتون', calories: 884 },
            { id: 60, name: 'زيت زيتون بكر ممتاز عضوي', calories: 884 },
            { id: 61, name: 'زيت عباد الشمس', calories: 884 },
            { id: 62, name: 'زيت ذرة', calories: 884 },
            { id: 63, name: 'زيت جوز هند', calories: 862 },
            { id: 64, name: 'سمن', calories: 876 },
            
            // البقوليات
            { id: 65, name: 'فول', calories: 341 },
            { id: 66, name: 'عدس', calories: 353 },
            { id: 67, name: 'حمص', calories: 378 },
            { id: 68, name: 'فاصوليا', calories: 347 },
            { id: 69, name: 'لوبيا', calories: 336 },
            
            // الصلصات والتوابل
            { id: 70, name: 'صلصة طماطم جاهزة', calories: 29 },
            { id: 71, name: 'كتشب', calories: 112 },
            { id: 72, name: 'مايونيز', calories: 680 },
            { id: 73, name: 'خردل', calories: 66 },
            { id: 74, name: 'طحينة', calories: 595 },
            { id: 75, name: 'ملح', calories: 0 },
            { id: 76, name: 'فلفل أسود', calories: 251 },
            { id: 77, name: 'كمون', calories: 375 },
            { id: 78, name: 'كزبرة', calories: 298 },
            { id: 79, name: 'بقدونس', calories: 36 },
            { id: 80, name: 'شبت', calories: 43 },
            
            // الحلويات والسكريات
            { id: 81, name: 'سكر أبيض', calories: 387 },
            { id: 82, name: 'عسل', calories: 304 },
            { id: 83, name: 'مربى', calories: 278 },
            { id: 84, name: 'شوكولاتة', calories: 546 },
            { id: 85, name: 'كنافة', calories: 405 },
            { id: 86, name: 'بسكويت', calories: 502 },
            
            // المشروبات
            { id: 87, name: 'شاي', calories: 1 },
            { id: 88, name: 'قهوة', calories: 2 },
            { id: 89, name: 'عصير برتقال', calories: 45 },
            { id: 90, name: 'عصير تفاح', calories: 46 },
            { id: 91, name: 'كولا', calories: 42 },
            { id: 92, name: 'ماء', calories: 0 },
            
            // أطعمة شائعة أخرى
            { id: 93, name: 'بيض', calories: 155 },
            { id: 94, name: 'تمر', calories: 277 },
            { id: 95, name: 'زيتون أخضر', calories: 145 },
            { id: 96, name: 'زيتون أسود', calories: 115 },
            { id: 97, name: 'خل', calories: 18 },
            { id: 98, name: 'عصير ليمون', calories: 22 },
            { id: 99, name: 'ملفوف', calories: 25 },
            { id: 100, name: 'فجل', calories: 16 }
        ];
    }
}