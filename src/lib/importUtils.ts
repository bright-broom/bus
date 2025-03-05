import type { BusRoute, DayOfWeek } from './types';

// =============================
// CSVデータをパースする関数
// =============================
export async function parseCSVData(file: File): Promise<BusRoute[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        if (!event.target) {
          throw new Error('ファイルの読み込みに失敗しました');
        }
        
        const csvData = event.target.result as string;
        const routes = processCSVData(csvData);
        resolve(routes);
      } catch (error) {
        reject(error instanceof Error ? error.message : '不明なエラーが発生しました');
      }
    };

    reader.onerror = () => {
      reject(new Error('CSVファイルの読み込みに失敗しました'));
    };

    reader.readAsText(file);
  });
}

// =============================
// CSVデータを処理し、BusRouteオブジェクトに変換
// =============================
function processCSVData(csvData: string): BusRoute[] {
  const lines = csvData.split('\n').map(line => line.trim()).filter(line => line !== '');
  if (lines.length < 2) {
    throw new Error('CSVファイルが空、またはデータが不足しています');
  }

  const headers = lines[0].split(',').map(header => header.trim());
  const requiredHeaders = ['route_id', 'route_name', 'route_color', 'stop_id', 'stop_name', 'departure_time', 'days_of_week'];

  // =============================
  // ヘッダーの検証
  // =============================
  const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
  if (missingHeaders.length > 0) {
    throw new Error(`CSVファイルに必要なヘッダーがありません: ${missingHeaders.join(', ')}`);
  }

  const routesMap = new Map<string, BusRoute>();

  // =============================
  // CSVデータの各行を処理
  // =============================
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(value => value.trim());
    if (values.length !== headers.length) {
      console.warn(`行 ${i + 1} の列数がヘッダーと一致しません。スキップします。`);
      continue;
    }

    const rowData: Record<string, string> = Object.fromEntries(headers.map((header, index) => [header, values[index]]));

    const routeId = rowData.route_id;
    const routeName = rowData.route_name;
    const routeColor = formatColor(rowData.route_color);
    const stopId = rowData.stop_id;
    const stopName = rowData.stop_name;
    const departureTime = rowData.departure_time;
    const daysOfWeek = parseDaysOfWeek(rowData.days_of_week);

     // =============================
    // 必須フィールドの検証
    // =============================
    if (!routeId || !routeName || !routeColor || !stopId || !stopName || !departureTime || daysOfWeek.length === 0) {
      console.warn(`行 ${i + 1} に必須フィールドがありません。スキップします。`);
      continue;
    }

    // =============================
    // ルートデータの作成・追加
    // =============================
    if (!routesMap.has(routeId)) {
      routesMap.set(routeId, { id: routeId, name: routeName, color: routeColor, stops: [] });
    }
    const route = routesMap.get(routeId);
    if (!route) {
      throw new Error(`ルート ${routeId} が見つかりません`);
    }


    // =============================
    // バス停の作成・追加
    // =============================
    let stop = route.stops.find(s => s.id === stopId);
    if (!stop) {
      stop = { id: stopId, name: stopName, departures: [] };
      route.stops.push(stop);
    }

    // =============================
    // 出発時刻の追加
    // =============================
    try {
      const validatedTime = validateTime(departureTime);
      stop.departures.push({ time: validatedTime, dayOfWeek: daysOfWeek });
    } catch (error) {
      console.warn(`行 ${i + 1} の時刻フォーマットが不正です: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return Array.from(routesMap.values());
}

// =============================
// HEXカラーコードのフォーマットを統一
// =============================
function formatColor(color: string): `#${string}` {
  const formatted = color.startsWith('#') ? color : `#${color}`;
  if (/^#[0-9A-Fa-f]{6}$/.test(formatted)) {
    return formatted as `#${string}`;
  }
  return '#000000';
}

// =============================
// 時刻フォーマットの検証と変換
// =============================
function validateTime(time: string): `${number}:${number}` {
  const parts = time.split(':');
  if (parts.length !== 2) {
    throw new Error(`不正な時刻フォーマット: ${time}`);
  }
  const [hours, minutes] = parts.map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`不正な時刻フォーマット: ${time}`);
  }
  return `${hours}:${minutes}` as `${number}:${number}`;
}
// =============================
// 曜日文字列をDayOfWeek配列に変換
// =============================
function parseDaysOfWeek(daysString: string): DayOfWeek[] {
  const daysMap: Record<string, DayOfWeek> = {
    mon: 'monday', tue: 'tuesday', wed: 'wednesday', thu: 'thursday', fri: 'friday',
    sat: 'saturday', sun: 'sunday',
    月: 'monday', 火: 'tuesday', 水: 'wednesday', 木: 'thursday', 金: 'friday', 土: 'saturday', 日: 'sunday',
    monday: 'monday', tuesday: 'tuesday', wednesday: 'wednesday', thursday: 'thursday',
    friday: 'friday', saturday: 'saturday', sunday: 'sunday',
  };

  const specialDays: Record<string, DayOfWeek[]> = {
    weekday: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    平日: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    weekend: ['saturday', 'sunday'],
    weekends: ['saturday', 'sunday'],
    週末: ['saturday', 'sunday'],
    all: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    everyday: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    毎日: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  };

  return [...new Set(daysString.toLowerCase().split(/[,;\s]+/).flatMap(day => specialDays[day] ?? daysMap[day] ? [daysMap[day]] : []))];
}
