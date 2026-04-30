export function getTodoColorClass(todo) {
  if (todo?.is_completed) {
    return 'bg-green-50 text-gray-400 line-through';
  }

  if (!todo?.due_date) {
    return 'bg-white border-gray-200';
  }

  const now = new Date();
  const dueDate = new Date(todo.due_date);

  if (Number.isNaN(dueDate.getTime())) {
    return 'bg-white border-gray-200';
  }

  if (dueDate < now) {
    return 'bg-red-50 border-red-300';
  }

  if (dueDate.getTime() - now.getTime() <= 24 * 60 * 60 * 1000) {
    return 'bg-orange-50 border-orange-300';
  }

  return 'bg-white border-gray-200';
}

export function getTodoBadgeColor(todo) {
  if (todo?.is_completed) return 'green';
  if (todo?.is_overdue) return 'red';
  if (todo?.is_due_soon) return 'orange';
  return 'gray';
}

const statusLabels = {
  ko: {
    completed: '완료',
    overdue: '기한초과',
    dueSoon: '기한임박',
    inProgress: '진행중',
    noDueDate: '마감일 없음',
    duePrefix: '마감:',
    completedAt: '완료됨',
  },
  en: {
    completed: 'Completed',
    overdue: 'Overdue',
    dueSoon: 'Due soon',
    inProgress: 'In progress',
    noDueDate: 'No due date',
    duePrefix: 'Due:',
    completedAt: 'Completed',
  },
  ja: {
    completed: '完了',
    overdue: '期限超過',
    dueSoon: '期限間近',
    inProgress: '進行中',
    noDueDate: '期限なし',
    duePrefix: '期限:',
    completedAt: '完了済み',
  },
};

const localeByLanguage = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
};

function getLanguagePack(language) {
  return statusLabels[language] ?? statusLabels.ko;
}

export function getTodoStatusLabel(todo, language = 'ko') {
  const labels = getLanguagePack(language);
  if (todo?.is_completed) return labels.completed;
  if (todo?.is_overdue) return labels.overdue;
  if (todo?.is_due_soon) return labels.dueSoon;
  return labels.inProgress;
}

export function formatDueDate(dueDate, language = 'ko') {
  const labels = getLanguagePack(language);
  if (!dueDate) {
    return labels.noDueDate;
  }

  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime())) {
    return labels.noDueDate;
  }

  const locale = localeByLanguage[language] ?? localeByLanguage.ko;
  return `${labels.duePrefix} ${date.toLocaleDateString(locale)}`;
}

export function getTodoCompletedLabel(language = 'ko') {
  return getLanguagePack(language).completedAt;
}
