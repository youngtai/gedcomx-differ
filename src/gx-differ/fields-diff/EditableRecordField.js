import React from 'react'
import { RecordsDataContext } from '../RecordsContext'
import { getFieldsIntersection } from './FieldsDiff'
import {
  Button,
  Grid,
  IconButton,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  TextField,
  useTheme,
} from '@mui/material'
import { Delete } from '@mui/icons-material'
import { RECORD_FIELD_TYPE } from '../constants'

function hasMatchingField(field, comparingTo) {
  const fieldString = JSON.stringify(field)
  return (
    comparingTo?.find((f) => JSON.stringify(f) === fieldString) !== undefined
  )
}

export function updateFieldsData(recordsData) {
  recordsData.finalGx.fields = getFieldsIntersection(
    recordsData.gx.fields,
    recordsData.comparingToGx.fields
  )
  recordsData.setFinalGx(structuredClone(recordsData.finalGx))

  recordsData.setGx(structuredClone(recordsData.gx))
}

export default function EditableRecordField({ field, fieldIndex }) {
  const theme = useTheme()
  const recordsData = React.useContext(RecordsDataContext)
  const [isEditing, setIsEditing] = React.useState(false)
  const [value, setValue] = React.useState(field.values[0].text)
  const [type, setType] = React.useState(field.type)
  const [hasMatch, setHasMatch] = React.useState(
    hasMatchingField(field, recordsData.comparingToGx.fields)
  )

  const backgroundColor = hasMatch ? null : theme.palette.diff.background
  const textColor = hasMatch ? null : theme.palette.diff.color

  React.useEffect(() => {
    setHasMatch(hasMatchingField(field, recordsData.comparingToGx.fields))
  }, [field, recordsData.comparingToGx.fields])

  function handleSave() {
    setIsEditing(false)
    if (!value || !type) {
      return
    }
    recordsData.gx.fields[fieldIndex].values[0].text = value
    recordsData.gx.fields[fieldIndex].type = type

    updateFieldsData(recordsData)
  }

  function handleEdit() {
    setIsEditing(true)
  }

  function handleDelete() {
    const fields = recordsData.gx.fields
    fields.splice(fieldIndex, 1)
    recordsData.gx.fields = fields.filter((f) => f)
    if (fields.length === 0) {
      delete recordsData.gx.fields
    }

    updateFieldsData(recordsData)
  }

  return isEditing ? (
    <Paper sx={{ margin: 2, padding: 1 }} square elevation={4}>
      <Grid
        container
        spacing={1}
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid item xs={10}>
          <Grid container direction="column">
            <Grid item>
              <TextField
                value={value}
                size="small"
                fullWidth={true}
                onChange={(e) => setValue(e.target.value)}
                sx={{ marginY: 1 }}
              />
            </Grid>
            <Grid item>
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                {Object.keys(RECORD_FIELD_TYPE).map((key) => (
                  <MenuItem key={`type-${key}`} value={RECORD_FIELD_TYPE[key]}>
                    {key}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={2}>
          <Button onClick={handleSave}>Save</Button>
        </Grid>
      </Grid>
    </Paper>
  ) : (
    <Paper sx={{ margin: 2 }} square elevation={4}>
      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        sx={{ background: backgroundColor, paddingLeft: 2 }}
      >
        <Grid item>
          <Grid container direction="column" sx={{ color: textColor }}>
            <Grid item>
              <ListItemText
                primary={field.values[0].text}
                secondary={'Field Value'}
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </Grid>
            <Grid item>
              <ListItemText
                primary={field.type}
                secondary={'Field Type'}
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Button onClick={handleEdit}>Edit</Button>
          <IconButton onClick={handleDelete}>
            <Delete />
          </IconButton>
        </Grid>
      </Grid>
    </Paper>
  )
}
