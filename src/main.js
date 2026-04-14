import './fonts/ys-display/fonts.css'
import './style.css'

import {data as sourceData} from "./data/dataset_1.js";

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
import {initPagination} from "./components/pagination.js";
import {initSorting} from './components/sorting';
import {initFiltering} from './components/filtering';
import {initSearching} from './components/searching';

// Исходные данные используемые в render()
const api = initData(sourceData);

let sampleTable;
let applySorting, applyFiltering, updateIndexes, applyPagination, updatePagination;
let applySearching;

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    if (!sampleTable) return {};
    
    const state = processFormData(new FormData(sampleTable.container));

    if (state.totalFrom !== undefined || state.totalTo !== undefined) {
        state.total = [
            state.totalFrom !== undefined && state.totalFrom !== '' ? Number(state.totalFrom) : null,
            state.totalTo !== undefined && state.totalTo !== '' ? Number(state.totalTo) : null
        ];
    }

    const rowsPerPage = parseInt(state.rowsPerPage);
    const page = parseInt(state.page ?? 1);

    return {
        ...state,
        rowsPerPage,
        page
    };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
async function render(action) {
    let state = collectState(); // состояние полей из таблицы
    let query = {}; // здесь будут формироваться параметры запроса
    
    // Применяем все трансформации к query
    if (applySearching) query = applySearching(query, state, action);
    if (applyFiltering) query = applyFiltering(query, state, action);
    if (applySorting) query = applySorting(query, state, action);
    if (applyPagination) query = applyPagination(query, state, action);
    
    // Получаем данные с сервера
    const { total, items } = await api.getRecords(query);
    
    // Обновляем пагинатор и рендерим таблицу
    if (updatePagination) updatePagination(total, query);
    if (sampleTable) sampleTable.render(items);
}

const appRoot = document.querySelector('#app');

// Асинхронная функция инициализации
async function init() {
    const indexes = await api.getIndexes();
    
    // Инициализируем таблицу
    sampleTable = initTable({
        tableTemplate: 'table',
        rowTemplate: 'row',
        before: ['search', 'header', 'filter'],
        after: ['pagination']
    }, render);
    
    // Инициализируем сортировку
    applySorting = initSorting([
        sampleTable.header.elements.sortByDate,
        sampleTable.header.elements.sortByTotal
    ]);
    
    // Инициализируем фильтрацию
    const filtering = initFiltering(sampleTable.filter.elements);
    applyFiltering = filtering.applyFiltering;
    updateIndexes = filtering.updateIndexes;
    
    // Заполняем селекты индексами
    updateIndexes(sampleTable.filter.elements, {
        searchBySeller: indexes.sellers
    });
    
    // Инициализируем поиск
    applySearching = initSearching('search');
    
    // Инициализируем пагинацию
    const pagination = initPagination(sampleTable.pagination.elements, (el, page, isCurrent) => {
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    });
    applyPagination = pagination.applyPagination;
    updatePagination = pagination.updatePagination;
    
    // Добавляем таблицу в DOM
    appRoot.appendChild(sampleTable.container);
    
    // Вызываем рендер
    render();
}

// Запускаем приложение
init();