import { Modal } from '../../Modal';
import { DateInput } from '../../DateInput';
import { CustomSelect } from '../CustomSelect/CustomSelect';
import { TemporalFilterMode, type TemporalFilterMode as TemporalFilterModeValue } from '../../../enums/UIEnums';
import { useLocale } from '../../../store/LocaleContext';

interface TemporalFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: TemporalFilterModeValue;
  setMode: (mode: TemporalFilterModeValue) => void;
  month: number;
  setMonth: (month: number) => void;
  year: number;
  setYear: (year: number) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  defaultYear: number;
  onReset: () => void;
  onApply: () => void;
}

export function TemporalFilterModal(props: TemporalFilterModalProps) {
  const { t, locale } = useLocale();
  const monthOptions = Array.from({ length: 12 }, (_, month) => ({
    value: String(month),
    label: new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2000, month, 1)).replace(/^\p{L}/u, letter => letter.toUpperCase()),
  }));
  const yearOptions = [props.defaultYear - 2, props.defaultYear - 1, props.defaultYear, props.defaultYear + 1, props.defaultYear + 2]
    .map(year => ({ value: String(year), label: String(year) }));

  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose} title={t('filters.period')}>
      <div className="form-group">
        <label className="form-label">{t('filters.filterBy')}</label>
        <div className="flex gap-sm">
          {Object.values(TemporalFilterMode).map(mode => (
            <button key={mode} type="button" className={`btn flex-1 ${props.mode === mode ? 'btn-primary' : 'btn-alt-bg'}`} onClick={() => props.setMode(mode)}>
              {t(`filters.${mode}`)}
            </button>
          ))}
        </div>
      </div>

      {props.mode === TemporalFilterMode.PERIOD ? (
        <div className="form-row">
          <div className="form-group"><label className="form-label">{t('forecast.start')}</label><DateInput value={props.startDate} onChangeValue={props.setStartDate} className="form-input" /></div>
          <div className="form-group"><label className="form-label">{t('forecast.end')}</label><DateInput value={props.endDate} onChangeValue={props.setEndDate} className="form-input" /></div>
        </div>
      ) : (
        <div className="form-row">
          {props.mode === TemporalFilterMode.MONTH && <div className="form-group"><label className="form-label">{t('filters.month')}</label><CustomSelect value={String(props.month)} onChange={value => props.setMonth(Number(value))} options={monthOptions} /></div>}
          <div className="form-group"><label className="form-label">{t('filters.year')}</label><CustomSelect value={String(props.year)} onChange={value => props.setYear(Number(value))} options={yearOptions} /></div>
        </div>
      )}

      <div className="modal-actions-filters">
        <button type="button" className="btn flex-1 btn-alt-bg" onClick={props.onReset}>{t('filters.reset')}</button>
        <button type="button" className="btn btn-primary flex-1" onClick={props.onApply}>{t('filters.apply')}</button>
      </div>
    </Modal>
  );
}
