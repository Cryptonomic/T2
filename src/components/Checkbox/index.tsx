import React from 'react';
import MaterialCheckbox from '@mui/material/Checkbox';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Circle from '@mui/icons-material/PanoramaFishEye';
import theme from '../../styles/theme';

interface Props {
    isChecked: boolean;
    onCheck: () => void;
}

const styles = {
    width: 'auto',
};

const iconStyles = {
    fill: theme.colors.accent,
    width: 30,
    height: 30,
};

function Checkbox(props: Props) {
    const { isChecked, onCheck } = props;
    return (
        <MaterialCheckbox
            color="primary"
            checked={isChecked}
            onChange={onCheck}
            style={styles}
            checkedIcon={<CheckCircle style={iconStyles} />}
            icon={<Circle style={iconStyles} />}
        />
    );
}

export default Checkbox;
